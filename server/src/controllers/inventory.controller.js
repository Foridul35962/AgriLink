import { check, validationResult } from "express-validator";
import AsyncHandler from "../helpers/AsyncHandler.js";
import { CropCategory } from "../constants/product.types.js";
import ApiErrors from "../helpers/ApiErrors.js";
import Inventories from "../models/Inventory.model.js";
import ApiResponse from "../helpers/ApiResponse.js";
import cloudinary from "../config/cloudinary.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import mongoose from "mongoose";
import redis from "../config/redis.js";

export const addInventory = [
    check("productName")
        .notEmpty()
        .withMessage("product name is required")
        .trim(),

    check("category")
        .notEmpty()
        .withMessage("category is required")
        .trim()
        .isIn(CropCategory)
        .withMessage("Invalid category"),

    check("totalQuantity")
        .notEmpty()
        .withMessage("total quantity is required")
        .isLength({ min: 1 })
        .withMessage("quantity is minimum 1 required"),

    check("allocatedQuantity")
        .notEmpty()
        .withMessage("allocated quantity is required")
        .isLength({ min: 1 })
        .withMessage("allocated quantity is minimum 0 required"),

    check("pricePerUnit")
        .notEmpty()
        .withMessage("price per unit is required")
        .isLength({ min: 1 })
        .withMessage("allocated quantity is minimum 1 required"),

    check("unit")
        .notEmpty()
        .withMessage("unit is required")
        .trim()
        .isIn(["kg", "mon", "ton", "piece"])
        .withMessage("invalid unit value"),

    check("description")
        .optional()
        .isLength({ max: 300 })
        .withMessage("maximum length of description is must be 300 character"),

    AsyncHandler(async (req, res) => {
        const userId = req.user._id
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array())
        }

        const { productName, category, totalQuantity, allocatedQuantity, pricePerUnit, unit, description } = req.body

        const image = req.files?.[0];

        if (!image) {
            throw new ApiErrors(400, "image is required");
        }

        if (!image.mimetype.startsWith("image/")) {
            throw new ApiErrors(400, "only image files are allowed");
        }

        if (Number(allocatedQuantity) > Number(totalQuantity)) {
            throw new ApiErrors(400, "allocated quantity cannot be greater than total quantity");
        }

        const existingInventory = await Inventories.findOne({
            aratdarId: userId,
            productName,
            category
        })

        if (existingInventory) {
            throw new ApiErrors(409, "inventory already created")
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

        const inventory = await Inventories.create({
            aratdarId: userId,
            allocatedQuantity,
            category,
            description,
            image: upload,
            pricePerUnit,
            productName,
            status: "available",
            totalQuantity,
            unit
        })

        if (!inventory) {
            throw new ApiErrors(500, "inventory create failed")
        }

        inventory.image.publicId = undefined

        return res
            .status(201)
            .json(
                new ApiResponse(201, inventory, "inventory is created successfully")
            )
    })
]

export const editInventory = [
    check("productName")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("product name cannot be empty"),

    check("category")
        .optional()
        .trim()
        .isIn(CropCategory)
        .withMessage("Invalid category"),

    check("totalQuantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("total quantity must be at least 1"),

    check("allocatedQuantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("allocated quantity must be at least 0"),

    check("pricePerUnit")
        .optional()
        .isFloat({ min: 1 })
        .withMessage("price per unit must be at least 1"),

    check("unit")
        .optional()
        .trim()
        .isIn(["kg", "mon", "ton", "piece"])
        .withMessage("invalid unit value"),

    check("description")
        .optional()
        .isLength({ max: 300 })
        .withMessage("description must be maximum 300 characters"),

    AsyncHandler(async (req, res) => {

        const userId = req.user._id;

        const error = validationResult(req);

        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array());
        }

        const { inventoryId } = req.params;

        if (!inventoryId) {
            throw new ApiErrors(400, "inventory id is required");
        }

        if (!mongoose.isValidObjectId(inventoryId)) {
            throw new ApiErrors(400, "invalid inventory id")
        }

        const {
            productName,
            category,
            totalQuantity,
            allocatedQuantity,
            pricePerUnit,
            unit,
            description
        } = req.body;

        const image = req.files?.[0];

        if (image && !image.mimetype.startsWith("image/")) {
            throw new ApiErrors(400, "only image files are allowed");
        }

        const inventory = await Inventories.findOne({
            _id: inventoryId,
            aratdarId: userId
        });

        if (!inventory) {
            throw new ApiErrors(404, "inventory is not found");
        }

        // Final values after update
        const newTotalQuantity = totalQuantity ?? inventory.totalQuantity;

        const newAllocatedQuantity = allocatedQuantity ?? inventory.allocatedQuantity;

        if (
            Number(newAllocatedQuantity) >
            Number(newTotalQuantity)
        ) {
            throw new ApiErrors(400, "allocated quantity cannot be greater than total quantity");
        }

        let upload;

        if (image) {
            try {
                const uploaded = await uploadToCloudinary(
                    image.buffer,
                    "AgriLink"
                );

                upload = {
                    url: uploaded.secure_url,
                    publicId: uploaded.public_id
                };
            } catch (error) {
                throw new ApiErrors(500, "image upload failed");
            }
        }

        if (
            upload &&
            inventory.image &&
            inventory.image.publicId
        ) {
            try {
                await cloudinary.uploader.destroy(
                    inventory.image.publicId
                );
            } catch (error) {
                console.error("old image deletion failed:", error);
            }
        }

        // Update fields
        inventory.productName = productName ?? inventory.productName;

        inventory.category = category ?? inventory.category;

        inventory.totalQuantity = newTotalQuantity;

        inventory.allocatedQuantity = newAllocatedQuantity;

        inventory.pricePerUnit = pricePerUnit ?? inventory.pricePerUnit;

        inventory.unit = unit ?? inventory.unit;

        inventory.description = description ?? inventory.description;

        if (upload) {
            inventory.image = upload;
        }

        // Update status
        inventory.status = Number(newAllocatedQuantity) >= Number(newTotalQuantity) ? "depleted" : "available";

        const updatedInventory = await inventory.save();

        if (!updatedInventory) {
            throw new ApiErrors(500, "inventory update failed");
        }

        await redis.del(`inventory:${inventoryId}`)

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedInventory, "inventory updated successfully")
            );
    })
];

export const deleteInventory = AsyncHandler(async (req, res) => {
    const { inventoryId } = req.params
    const userId = req.user._id

    if (!inventoryId) {
        throw new ApiErrors(400, "inventory id is required")
    }

    if (!mongoose.isValidObjectId(inventoryId)) {
        throw new ApiErrors(400, "invalid inventory id")
    }

    const inventory = await Inventories.findById(inventoryId)
    if (!inventory) {
        throw new ApiErrors(404, "inventory is not found")
    }

    if (inventory.aratdarId.toString() !== userId.toString()) {
        throw new ApiErrors(403, "unauthenticated access")
    }

    await inventory.deleteOne()
    await redis.del(`inventory:${inventoryId}`)

    return res
        .status(200)
        .json(
            new ApiResponse(200, inventoryId, "inventory remove successfully")
        )
})

export const getMyInventories = AsyncHandler(async (req, res) => {
    const userId = req.user._id
    const { productName, category } = req.params

    const page = Number(req.query.page) || 1;

    if (category && !CropCategory.includes(category)) {
        throw new ApiErrors(400, "invalid category")
    }

    const limit = 15;
    const skip = (page - 1) * limit;

    const matchStage = {
        aratdarId: new mongoose.Types.ObjectId(userId)
    };

    if (productName) {
        matchStage.productName = { $regex: productName, $options: "i" }
    }

    if (category) {
        matchStage.category = category
    }

    const pipelineResult = await Inventories.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },

        {
            $facet: {
                metadata: [{ $count: "totalInventories" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            productName: 1,
                            category: 1,
                            status: 1,
                            pricePerUnit: 1,
                            totalQuantity: 1,
                            unit: 1,
                            image: { url: "$image.url" }
                        }
                    }
                ]
            }
        }
    ]);

    const result = pipelineResult[0];
    const inventories = result?.data || [];
    const totalInventories = result?.metadata[0]?.totalInventories || 0;

    const finalResult = {
        inventories,
        pagination: {
            currentPage: page,
            limit,
            totalInventories,
            totalPages: Math.ceil(totalInventories / limit)
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalResult, "my inventories fetch successfull")
        )
})

export const getInventoryDetails = AsyncHandler(async (req, res) => {
    const userRole = req.user.role

    const { inventoryId } = req.params
    if (!inventoryId) {
        throw new ApiErrors(400, "inventory id is required")
    }

    if (!mongoose.isValidObjectId(inventoryId)) {
        throw new ApiErrors(400, "invalid inventory id")
    }

    if (!["retailer", "aratdar", "admin"].includes(userRole)) {
        throw new ApiErrors(401, "unauthorized access")
    }

    const redisKey = `inventory:${inventoryId}`
    const redisInventory = await redis.get(redisKey)
    let inventory
    if (redisInventory) {
        inventory = JSON.parse(redisInventory)
    } else {
        inventory = await Inventories.findById(inventoryId)
        if (!inventory) {
            throw new ApiErrors(404, "inventory is not found")
        }

        inventory.image.publicId = undefined

        await redis.set(redisKey,
            JSON.stringify(inventory),
            "EX", 300
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, inventory, "inventory details fetch done")
        )
})

export const getAllInventories = AsyncHandler(async (req, res) => {
    const userRole = req.user.role

    if (!["retailer", "aratdar", "admin"].includes(userRole)) {
        throw new ApiErrors(401, "unauthorized access")
    }

    const { category, name } = req.query;
    if (category && !CropCategory.includes(category)) {
        throw new ApiErrors(400, "invalid category")
    }

    const page = Number(req.query.page) || 1;

    const limit = 15;
    const skip = (page - 1) * limit;

    const matchStage = {};

    if (name) {
        matchStage.name = { $regex: name, $options: "i" };
    }
    if (category) {
        matchStage.category = category
    }

    const pipelineResult = await Products.aggregate([
        { $match: matchStage },
        {
            $facet: {
                metadata: [{ $count: "totalInventories" }],
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            productName: 1,
                            category: 1,
                            status: 1,
                            pricePerUnit: 1,
                            totalQuantity: 1,
                            unit: 1,
                            image: { url: "$image.url" }
                        }
                    }
                ]
            }
        }
    ]);

    const result = pipelineResult[0];
    const inventory = result?.data || [];
    const totalInventories = result?.metadata[0]?.totalInventories || 0;

    const finalResult = {
        inventory,
        pagination: {
            currentPage: page,
            limit,
            totalInventories,
            totalPages: Math.ceil(totalInventories / limit)
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalResult, "all inventory fetch successfull")
        )
})