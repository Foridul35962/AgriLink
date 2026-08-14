import { CropCategory } from "../constants/product.types.js";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import { check, validationResult } from "express-validator"
import Crops from "../models/Crop.model.js";
import ApiResponse from "../helpers/ApiResponse.js";
import mongoose from "mongoose";
import CropRecommendations from "../models/CropRecommendation.model.js";
import redis from "../config/redis.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";
import { DISTRICTS } from "../constants/common.types.js";
import axios from 'axios'

export const createCrop = [
    check("name")
        .trim()
        .notEmpty()
        .withMessage("Crop name is required"),

    check("banglaName")
        .trim()
        .notEmpty()
        .withMessage("Bangla crop name is required"),

    check("category")
        .notEmpty()
        .withMessage("category is required")
        .trim()
        .isIn(CropCategory)
        .withMessage("Invalid crop category"),

    check("description")
        .optional()
        .trim(),

    check("weatherRequirement.minTemperature")
        .notEmpty()
        .withMessage("minimum temperature is required")
        .isNumeric()
        .withMessage("Minimum teperature must be a number"),

    check("weatherRequirement.maxTemperature")
        .notEmpty()
        .withMessage("maximum temperature is required")
        .isNumeric()
        .withMessage("Maximum teperature must be a number"),

    check("weatherRequirement.maxHumidity")
        .optional()
        .isNumeric()
        .withMessage("Maximum humidity must be a number"),

    check("weatherRequirement.maxRainProbability")
        .optional()
        .isNumeric()
        .withMessage("Maximum rain probability must be a number"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "Invalid value", error.array())
        }

        const {
            name,
            banglaName,
            category,
            description,
            weatherRequirement,
            waterRequirement,
            suitableSoil,
            cultivationDuration,
            cultivationTips
        } = req.body

        const image = req.files[0]
        if (!image) {
            throw new ApiErrors(400, "image is required")
        }

        if (!image.mimetype.startsWith('image/')) {
            throw new ApiErrors(400, 'only image files are allowed')
        }

        const existingCrop = await Crops.findOne({
            name: {
                $regex: `${name}$`,
                $options: "i"
            }
        })

        if (existingCrop) {
            throw new ApiErrors(409, "This crop is already exists")
        }

        let upload
        try {
            const uploaded = await uploadToCloudinary(image.buffer, "AgriLink")
            upload = {
                url: uploaded.secure_url,
                publicId: uploaded.public_id
            }
        } catch (error) {
            throw new ApiErrors(500, "image upload failed")
        }

        const crop = await Crops.create({
            name,
            banglaName,
            image: upload,
            category,
            description,
            weatherRequirement,
            waterRequirement,
            suitableSoil,
            cultivationDuration,
            cultivationTips,
        })

        if (!crop) {
            throw new ApiErrors(500, "crop create failed")
        }

        crop.image.publicId = undefined

        return res
            .status(201)
            .json(
                new ApiResponse(201, crop, "crop created successfully")
            )
    })
]

export const getAllCrop = AsyncHandler(async (req, res) => {
    const { name, category } = req.query;

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = 15;
    const skip = (page - 1) * limit;

    if (category && !CropCategory.includes(category)) {
        throw new ApiErrors(400, "Invalid category")
    }

    const matchStage = {};

    if (name) {
        matchStage.name = { $regex: name, $options: "i" };
    }

    if (category) {
        matchStage.category = category;
    }

    // Get crops + total count at the same time
    const [crops, totalCrops] = await Promise.all([
        Crops.find(matchStage)
            .select(
                "name banglaName category image.url waterRequirement suitableSoil"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Crops.countDocuments(matchStage),
    ]);

    const totalPages = Math.ceil(totalCrops / limit);

    const finalData = {
        crops: crops,
        pagination: {
            currentPage: page,
            limit,
            totalCrops,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalData, "all crop fetch success")
        )
});

export const getCrop = AsyncHandler(async (req, res) => {
    const { cropId } = req.params
    if (!cropId) {
        throw new ApiErrors(400, "crop id is required")
    }

    if (!mongoose.isValidObjectId(cropId)) {
        throw new ApiErrors(400, "invalid crop id")
    }

    const redisKey = `cropDetails:${cropId}`
    const redisCrop = await redis.get(redisKey)
    let finalResult
    if (redisCrop) {
        finalResult = JSON.parse(redisCrop)
    } else {
        const [crop, recommendation] = await Promise.all([
            Crops.findById(cropId)
                .select("-image.publicId"),

            CropRecommendations.findOne({ cropId })
        ])
        if (!crop) {
            throw new ApiErrors(404, "crop is not found")
        }

        finalResult = {
            crop,
            recommendation
        }

        await redis.set(redisKey,
            JSON.stringify(finalResult),
            "EX", 600
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalResult, "crop details fetch successfully")
        )
})

export const updateCrop = AsyncHandler(async (req, res) => {
    const { cropId } = req.params;

    // Validate cropId
    if (!cropId) {
        throw new ApiErrors(400, "crop id is required");
    }

    if (!mongoose.isValidObjectId(cropId)) {
        throw new ApiErrors(400, "invalid cropId");
    }

    const {
        name,
        banglaName,
        category,
        description,
        weatherRequirement,
        waterRequirement,
        suitableSoil,
        cultivationDuration,
        cultivationTips,
    } = req.body;

    // Optional image
    const image = req.files?.[0];

    if (image && !image.mimetype.startsWith("image/")) {
        throw new ApiErrors(400, "only image files are allowed");
    }

    // Find crop
    const crop = await Crops.findById(cropId);

    if (!crop) {
        throw new ApiErrors(404, "crop is not found");
    }

    // Check duplicate crop name
    if (name && name !== crop.name) {
        const existingCrop = await Crops.findOne({
            name: {
                $regex: `^${name}$`,
                $options: "i",
            },
            _id: {
                $ne: cropId,
            },
        });

        if (existingCrop) {
            throw new ApiErrors(
                409,
                "this crop name already exists"
            );
        }
    }

    // Upload new image if provided
    let upload;

    if (image) {
        try {
            const uploaded = await uploadToCloudinary(
                image.buffer,
                "AgriLink"
            );

            upload = {
                url: uploaded.secure_url,
                publicId: uploaded.public_id,
            };

            // Delete old image
            if (crop.image?.publicId) {
                await cloudinary.uploader.destroy(
                    crop.image.publicId
                );
            }
        } catch (error) {
            throw new ApiErrors(500, "image upload failed");
        }
    }

    // Update fields
    crop.name = name ?? crop.name;
    crop.banglaName = banglaName ?? crop.banglaName;
    crop.category = category ?? crop.category;
    crop.description = description ?? crop.description;
    crop.weatherRequirement = weatherRequirement ?? crop.weatherRequirement;
    crop.waterRequirement = waterRequirement ?? crop.waterRequirement;
    crop.suitableSoil = suitableSoil ?? crop.suitableSoil;
    crop.cultivationDuration = cultivationDuration ?? crop.cultivationDuration;
    crop.cultivationTips = cultivationTips ?? crop.cultivationTips;

    // Update image
    if (upload) {
        crop.image = upload;
    }

    const updatedCrop = await crop.save();
    crop.image.publicId = undefined

    // Clear cache
    await redis.del(`cropDetails:${cropId}`);

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedCrop,
            "crop updated successfully"
        )
    );
});

export const deleteCrop = AsyncHandler(async (req, res) => {
    const { cropId } = req.params
    if (!cropId) {
        throw new ApiErrors(400, "crop id is required")
    }

    if (!mongoose.isValidObjectId(cropId)) {
        throw new ApiErrors(400, "invalid crop id")
    }

    // const session = await mongoose.startSession()

    // try {
    // session.startTransaction()

    const crop = await Crops.findById(cropId)
    // .session(session)

    if (!crop) {
        throw new ApiErrors(404, "crop is not found")
    }

    try {
        await cloudinary.uploader.destroy(
            crop.image.publicId
        );
    } catch (error) {
        throw new ApiErrors(500, "image delete failed")
    }

    await Promise.all([
        crop.deleteOne(
            // { session }
        ),

        CropRecommendations.findOneAndDelete({ cropId },
            // { session }
        )
    ])

    // await session.commitTransaction()

    await redis.del(`cropDetails:${cropId}`);

    return res
        .status(200)
        .json(
            ApiResponse(200, cropId, "crop deleted successfully")
        )

    // } catch (error) {
    //     await session.abortTransaction()

    //     throw error
    // } finally {
    //     await session.endSession()
    // }
})

export const createCropRecommendation = [
    check("cropId")
        .notEmpty()
        .withMessage("cropId is required")
        .isMongoId()
        .withMessage("Invalid cropId"),

    check("districts")
        .isArray({ min: 1 })
        .withMessage("At least one district is required"),

    check("districts.*")
        .trim()
        .notEmpty()
        .withMessage("District cannot be empty")
        .isIn(DISTRICTS)
        .withMessage("Invalid district"),

    check("plantingMonths")
        .isArray({ min: 1 })
        .withMessage("At least one planting month is required"),

    check("plantingMonths.*")
        .isInt({ min: 1, max: 12 })
        .withMessage(
            "Planting month must be between 1 and 12"
        ),

    check("season")
        .optional()
        .trim()
        .isIn(["kharif-1", "kharif-2", "rabi", "all"])
        .withMessage("Invalid season"),

    check("reason")
        .optional()
        .trim(),

    check("tips")
        .optional()
        .isArray()
        .withMessage("Tips must be an array"),

    check("tips.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Tip cannot be empty"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array())
        }

        const { cropId, districts, plantingMonths, season, reason, tips } = req.body
        const existingRecommendation = await CropRecommendations.findOne({ cropId })
        if (existingRecommendation) {
            throw new ApiErrors(409, "crop recommendation is already existed")
        }

        const recommendation = await CropRecommendations.create({
            cropId,
            districts,
            plantingMonths,
            season,
            reason,
            tips
        })

        if (!recommendation) {
            throw new ApiErrors(500, "recommendation added failed")
        }

        await redis.del(`cropDetails:${cropId}`);

        return res
            .status(201)
            .json(
                new ApiResponse(201, recommendation, "recommendation added successfully")
            )
    })
]

export const updateCropRecommendation = [
    check("cropRecommendationId")
        .notEmpty()
        .withMessage("cropRecommendationId is required")
        .isMongoId()
        .withMessage("Invalid cropRecommendationId"),

    check("districts")
        .optional()
        .isArray({ min: 1 })
        .withMessage("At least one district is required"),

    check("districts.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("District cannot be empty")
        .isIn(DISTRICTS)
        .withMessage("Invalid district"),

    check("plantingMonths")
        .optional()
        .isArray({ min: 1 })
        .withMessage("At least one planting month is required"),

    check("plantingMonths.*")
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage(
            "Planting month must be between 1 and 12"
        ),

    check("season")
        .optional()
        .trim()
        .isIn(["kharif-1", "kharif-2", "rabi", "all"])
        .withMessage("Invalid season"),

    check("reason")
        .optional()
        .trim(),

    check("tips")
        .optional()
        .isArray()
        .withMessage("Tips must be an array"),

    check("tips.*")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Tip cannot be empty"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "Invalid value", error.array())
        }

        const { cropRecommendationId, districts, plantingMonths, season, reason, tips } = req.body

        if (!districts && !plantingMonths && !season && !reason && !tips) {
            throw new ApiErrors(400, "minimum one field are required")
        }

        const cropRecommendation = await CropRecommendations.findById(cropRecommendationId)
        if (!cropRecommendation) {
            throw new ApiErrors(404, "crop recommendation is not found")
        }

        cropRecommendation.districts = districts ?? cropRecommendation.districts
        cropRecommendation.plantingMonths = plantingMonths ?? cropRecommendation.plantingMonths
        cropRecommendation.season = season ?? cropRecommendation.season
        cropRecommendation.reason = reason ?? cropRecommendation.reason
        cropRecommendation.tips = tips ?? cropRecommendation.tips

        const updatedRecommendation = await cropRecommendation.save()

        await redis.del(`cropDetails:${cropRecommendation.cropId}`);

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedRecommendation, "crop recommendation updated")
            )
    })
]

export const deleteCropRecommendation = AsyncHandler(async (req, res) => {
    const { cropRecommendationId } = req.params
    if (!cropRecommendationId) {
        throw new ApiErrors(400, "crop recommendation id is required")
    }

    if (!mongoose.isValidObjectId(cropRecommendationId)) {
        throw new ApiErrors(400, "Invalid crop recommendation id")
    }

    let crop
    try {
        crop = await CropRecommendations.findByIdAndDelete(cropRecommendationId)
    } catch (error) {
        throw new ApiErrors(404, "crop recommendation is not found")
    }

    await redis.del(`cropDetails:${crop.cropId}`);

    return res
        .status(200)
        .json(
            new ApiResponse(200, { cropId: crop.cropId, cropRecommendationId }, "crop recommendation is deleted successfully")
        )
})

const getSeason = (month) => {
    if (month >= 3 && month <= 6)
        return "kharif-1";

    if (month >= 7 && month <= 10)
        return "kharif-2";

    if (month >= 11 || month <= 2)
        return "rabi";
}

export const getCropSuggestion = AsyncHandler(async (req, res) => {
    const { districts } = req.params
    if (!districts) {
        throw new ApiErrors(400, "districts is needed")
    }

    if (!DISTRICTS.includes(districts)) {
        throw new ApiErrors(400, "invalid districs")
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1;
    const currentSeason = getSeason(currentMonth)

    const weatherCacheKey = `weather:districts:${districts}`

    let weather
    const cacheWeather = await redis.get(weatherCacheKey)

    if (cacheWeather) {
        weather = JSON.parse(cacheWeather)
    } else {
        const weatherResponse = await axios.get(`${process.env.WEATHER_API_URL}`, {
            params: {
                q: districts,
                key: process.env.WEATHER_API_KEY,
                aqi: "no"
            }
        })

        const weatherData = weatherResponse.data

        if (!weatherData) {
            throw new ApiErrors(500, "weather data fetch failed")
        }

        weather = {
            location: weatherData.location,
            temperature: weatherData.current?.temp_c ?? null,
            humidity: weatherData.current?.humidity ?? null,
            rainProbability: weatherData.current?.chance_of_rain ?? 0,
            rainfall: weatherData.current?.precip_mm ?? 0,
            condition: weatherData.current?.condition?.text ?? null,
        }

        await redis.set(
            weatherCacheKey,
            JSON.stringify(weather),
            "EX",
            2000
        )
    }

    const cropRecommendation = await CropRecommendations.find({
        $and: [
            {
                $or: [
                    {
                        districts: districts
                    },
                    {
                        districts: {
                            $size: 0
                        }
                    }
                ]
            },
            {
                plantingMonths: currentMonth
            },
            {
                $or: [
                    {
                        season: currentSeason
                    },
                    {
                        season: "all"
                    }
                ]
            }
        ]
    })
        .select("-reason -tips")
        .populate({
            path: "cropId",
            select: "_id name banglaName category image.url  waterRequirement suitableSoil"
        })

    const recommendation = cropRecommendation
        .filter((rule) => {
            const crop = rule.cropId;

            if (!crop) {
                return false;
            }

            const requirement = crop.weatherRequirement;

            if (!requirement) {
                return true;
            }

            if (
                weather.temperature !== null &&
                weather.temperature !== undefined
            ) {
                if (
                    requirement.minTemperature !== undefined &&
                    weather.temperature < requirement.minTemperature
                ) {
                    return false;
                }

                if (
                    requirement.maxTemperature !== undefined &&
                    weather.temperature > requirement.maxTemperature
                ) {
                    return false;
                }
            }

            if (
                weather.humidity !== null &&
                weather.humidity !== undefined
            ) {

                if (
                    requirement.minHumidity !== undefined &&
                    weather.humidity < requirement.minHumidity
                ) {
                    return false;
                }

                if (
                    requirement.maxHumidity !== undefined &&
                    weather.humidity > requirement.maxHumidity
                ) {
                    return false;
                }
            }

            if (
                weather.rainProbability !== null &&
                weather.rainProbability !== undefined
            ) {
                if (
                    requirement.maxRainProbability !== undefined &&
                    weather.rainProbability > requirement.maxRainProbability
                ) {
                    return false;
                }
            }
            return true;
        })
        .map((rule) => {
            return {
                crop: {
                    _id: rule.cropId._id,

                    name: rule.cropId.name,

                    banglaName: rule.cropId.banglaName,

                    category: rule.cropId.category,

                    image: rule.cropId.image?.url || null,
                    waterRequirement: rule.cropId.waterRequirement,
                    suitableSoil: rule.cropId.suitableSoil
                },
            }
        });

    const finalResponse = {
        location: {
            districts,
        },
        currentMonth,
        season: currentSeason,
        weather,
        count: recommendation.length,
        data: recommendation
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalResponse, "crop suggestion fetch successfully")
        )
})