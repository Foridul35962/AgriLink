import { check, validationResult } from 'express-validator'
import AsyncHandler from '../helpers/AsyncHandler.js'
import ApiErrors from '../helpers/ApiErrors.js'
import { DISTRICTS } from '../constants/common.types.js'
import uploadToCloudinary from '../utils/uploadToCloudinary.js'
import Products from '../models/Product.model.js'
import ApiResponse from '../helpers/ApiResponse.js'
import cloudinary from '../config/cloudinary.js'
import redis from '../config/redis.js'

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

        const product = await Products.create({
            farmerId: userId,
            name: name,
            category: category,
            quantity: quantity,
            unit: unit,
            pricePerUnit: pricePerUnit,
            description: description,
            district: district,
            harvestDate: harvestDate,
            status: "available",
            image: upload
        })

        if (!product) {
            throw new ApiErrors(500, "product create failed")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, product, "product created successfully")
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
        .select("image farmerId")

    if (!product) {
        throw new ApiErrors(404, "product is not found")
    }

    if (product.farmerId.toString() !== userId.toString()) {
        throw new ApiErrors(401, "unauthorized access")
    }

    try {
        await cloudinary.uploader.destroy(product.image.publicId)
    } catch (error) {
        throw new ApiErrors(500, "image remove failed")
    }

    await product.deleteOne()
    await redis.del(`product:${productId}`)

    return res
        .status(200)
        .json(
            new ApiResponse(200, productId, "product remove sucessfully")
        )
})