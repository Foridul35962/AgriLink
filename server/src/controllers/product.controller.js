import { check, validationResult } from 'express-validator'
import AsyncHandler from '../helpers/AsyncHandler.js'
import ApiErrors from '../helpers/ApiErrors.js'
import { DISTRICTS } from '../constants/common.types.js'
import uploadToCloudinary from '../utils/uploadToCloudinary.js'
import Products from '../models/Product.model.js'
import ApiResponse from '../helpers/ApiResponse.js'
import cloudinary from '../config/cloudinary.js'
import redis from '../config/redis.js'
import mongoose from 'mongoose'
import Auction from '../models/auctions.model.js'
import Bids from '../models/bids.model.js'

export const addProduct = [
    check("name")
        .trim()
        .notEmpty()
        .withMessage("product name is required"),
    check("category")
        .notEmpty()
        .withMessage("category is required"),
    check("quantity")
        .notEmpty()
        .withMessage("quantity is required")
        .isInt({ min: 1 })
        .withMessage("quantity must be greater than 0"),
    check("pricePerUnit")
        .notEmpty()
        .withMessage("price is required")
        .isFloat({ min: 0.1 })
        .withMessage("price is required"),
    check("district")
        .notEmpty()
        .withMessage("district is required")
        .custom((value) => {
            if (!DISTRICTS.includes(value)) {
                throw new Error("invalid district");
            }
            return true;
        }),
    check("harvestDate")
        .notEmpty()
        .withMessage("harvest date is required")
        .isISO8601()
        .withMessage("harvest date must be a valid date"),
    check("unit")
        .notEmpty()
        .withMessage("unit is required")
        .isIn(["kg", "mon", "ton", "piece"])
        .withMessage("invalid unit"),
    check("description")
        .optional()
        .isLength({ max: 300 })
        .withMessage("description is must be lower than 300"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array())
        }

        const userId = req.user._id

        const { name, category, quantity, unit, pricePerUnit, district, harvestDate, description } = req.body

        const image = req.files && req.files[0];
        if (!image) {
            throw new ApiErrors(400, "image is required")
        }

        if (!image.mimetype.startsWith('image/')) {
            throw new ApiErrors(400, 'only image files are allowed')
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

        const productId = new mongoose.Types.ObjectId();
        const auctionId = new mongoose.Types.ObjectId();

        const startPrice = Number(pricePerUnit) * Number(quantity);

        const productData = {
            _id: productId,
            farmerId: userId,
            name: name,
            category: category,
            quantity: quantity,
            unit: unit,
            pricePerUnit: pricePerUnit,
            description: description,
            district: district,
            harvestDate: harvestDate,
            auctionId: auctionId,
            status: "available",
            image: upload
        }

        const auctionData = {
            _id: auctionId,
            productId: productId,
            startPrice,
            currentHighestBid: 0,
            startTime: new Date(),
            endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
            status: "ACTIVE"
        };

        const [product, auction] = await Promise.all([
            Products.create(productData),
            Auction.create(auctionData)
        ]);

        if (!product || !auction) {
            throw new ApiErrors(500, "product or auction create failed")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, { product, auction }, "product created successfully")
            )
    })
]

export const editProduct = [
    check("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("product name cannot be empty"),
    check("category")
        .optional()
        .notEmpty()
        .withMessage("category cannot be empty"),
    check("quantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("quantity must be greater than 0"),
    check("pricePerUnit")
        .optional()
        .isFloat({ min: 0.1 })
        .withMessage("price must be greater than 0"),
    check("district")
        .optional()
        .custom((value) => {
            if (!DISTRICTS.includes(value)) {
                throw new Error("invalid district");
            }
            return true;
        }),
    check("harvestDate")
        .optional()
        .isISO8601()
        .withMessage("harvest date must be a valid date"),
    check("unit")
        .optional()
        .isIn(["kg", "mon", "ton", "piece"])
        .withMessage("invalid unit"),
    check("description")
        .optional()
        .isLength({ max: 300 })
        .withMessage("description must be lower than 300 characters"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array())
        }

        const userId = req.user._id
        const { productId } = req.params

        const { name, category, quantity, unit, pricePerUnit, district, harvestDate, description } = req.body

        const image = req.files && req.files[0];
        if (image && !image.mimetype.startsWith('image/')) {
            throw new ApiErrors(400, 'only image files are allowed')
        }

        const product = await Products.findById(productId)
        if (!product) {
            throw new ApiErrors(404, "product is not found")
        }

        if (product.farmerId.toString() !== userId.toString()) {
            throw new ApiErrors(401, "unauthorized access")
        }

        const [auction, bid] = await Promise.all([
            Auction.findById(product.auctionId),
            Bids.findOne({ auctionId: product.auctionId })
        ])

        if (!auction) {
            throw new ApiErrors(404, "auction is not found")
        }

        if (bid) {
            throw new ApiErrors(400, "Bid is started. Edit not allowed")
        }

        let upload
        if (image) {
            try {
                const uploaded = await uploadToCloudinary(image.buffer, "AgriLink")
                upload = {
                    url: uploaded.secure_url,
                    publicId: uploaded.public_id
                }

                if (product.image && product.image.publicId) {
                    await cloudinary.uploader.destroy(product.image.publicId)
                }
            } catch (error) {
                throw new ApiErrors(500, "image upload failed")
            }
        }

        const oldPrice = product.pricePerUnit;
        const oldQuantity = product.quantity;

        product.name = name ?? product.name
        product.category = category ?? product.category
        product.quantity = quantity ?? product.quantity
        product.pricePerUnit = pricePerUnit ?? product.pricePerUnit
        product.unit = unit ?? product.unit
        product.district = district ?? product.district
        product.harvestDate = harvestDate ?? product.harvestDate
        product.description = description ?? product.description

        if (upload) {
            product.image = upload
        }

        if (oldPrice !== product.pricePerUnit || oldQuantity !== product.quantity) {
            auction.startPrice = Number(product.pricePerUnit) * Number(product.quantity);
            await auction.save();
        }

        const updatedProduct = await product.save()
        if (!updatedProduct) {
            throw new ApiErrors(500, "product update failed")
        }

        if (typeof redis !== 'undefined' && redis.del) {
            await redis.del(`product:${productId}`)
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedProduct, "product updated successfully")
            )
    })
]

export const deleteProduct = AsyncHandler(async (req, res) => {
    const userId = req.user._id
    const { productId } = req.params
    if (!productId) {
        throw new ApiErrors(400, "product id is required")
    }

    const product = await Products.findById(productId)
        .select("image farmerId auctionId")
        .populate({
            path: "auctionId",
            select: "status"
        })

    if (!product) {
        throw new ApiErrors(404, "product is not found")
    }

    if (product.farmerId.toString() !== userId.toString()) {
        throw new ApiErrors(401, "unauthorized access")
    }

    if (product.auctionId.status === "ACTIVE") {
        const bid = await Bids.findOne({ auctionId: product.auctionId._id })
        if (bid) {
            throw new ApiErrors(400, "Cannot delete product after bidding started")
        }
    }

    try {
        await cloudinary.uploader.destroy(product.image.publicId)
    } catch (error) {
        throw new ApiErrors(500, "image remove failed")
    }

    await Auction.findByIdAndDelete(product.auctionId._id);
    await product.deleteOne()
    await redis.del(`product:${productId}`)

    return res
        .status(200)
        .json(
            new ApiResponse(200, productId, "product remove sucessfully")
        )
})

export const getAllMyProducts = AsyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { category, status } = req.query;
    const page = Number(req.query.page) || 1;

    const limit = 15;
    const skip = (page - 1) * limit;

    const matchStage = {
        farmerId: new mongoose.Types.ObjectId(userId)
    };

    if (category) {
        matchStage.category = category;
    }

    if (status) {
        matchStage.status = status;
    }

    const pipelineResult = await Products.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },

        {
            $facet: {
                metadata: [{ $count: "totalProducts" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            name: 1,
                            category: 1,
                            status: 1,
                            pricePerUnit: 1,
                            quantity: 1,
                            unit: 1,
                            image: { url: "$image.url" }
                        }
                    }
                ]
            }
        }
    ]);

    const result = pipelineResult[0];
    const products = result?.data || [];
    const totalProducts = result?.metadata[0]?.totalProducts || 0;

    const finalResult = {
        products,
        pagination: {
            currentPage: page,
            limit,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit)
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalResult, "farmer products fetched successfully via aggregation pipeline")
        );
});

export const getProduct = AsyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userRole = req.user.role

    if (!productId) {
        throw new ApiErrors(400, "product id is required");
    }

    if (!["farmer", "aratdar"].includes(userRole)) {
        throw new ApiErrors(401, "unauthorized access")
    }

    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiErrors(400, "invalid product id");
    }

    const redisKey = `product:${productId}`;
    const redisProduct = await redis.get(redisKey);
    if (redisProduct) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, JSON.parse(redisProduct), "product fetched successfully")
            );
    }

    const product = await Products.findById(productId)
        .select("-image.publicId")
        .populate({
            path: "farmerId",
            select: "name phoneNumber district"
        })
        .populate({
            path: "auctionId",
            select:
                "startPrice currentHighestBid highestBidder startTime endTime status winnerBidId selectedAt"
        });

    if (!product) {
        throw new ApiErrors(404, "product is not found");
    }

    let topBids = [];
    let winner = null;

    if (product.auctionId) {
        topBids = await Bids.find({
            auctionId: product.auctionId._id
        })
            .sort({
                bidAmount: -1
            })
            .limit(5)
            .populate({
                path: "aratdarId",
                select: "name phoneNumber district"
            });

        // Winner info
        if (product.auctionId.winnerBidId) {
            const winnerBid = await Bids.findById(
                product.auctionId.winnerBidId
            )
                .populate({
                    path: "aratdarId",
                    select: "name phoneNumber district"
                });

            if (winnerBid) {
                winner = {
                    bidAmount: winnerBid.bidAmount,
                    aratdar: winnerBid.aratdarId
                };
            }
        }
    }

    const response = {
        product: product,
        auction: product.auctionId,
        topBids,
        winner
    };

    await redis.set(
        redisKey,
        JSON.stringify(response),
        "EX",
        300
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                response,
                "product fetched successfully"
            )
        );
});