import mongoose from "mongoose";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Orders from "../models/Order.model.js";
import ApiResponse from "../helpers/ApiResponse.js";
import redis from "../config/redis.js";

export const getFarmerReceiveOrder = AsyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const userId = req.user._id;

    const [orders, totalOrders] = await Promise.all([
        Orders.find({
            sellerId: userId,
            sellerRole: "farmer"
        })
            .select(
                "productId quantity unit totalAmount status createdAt"
            )
            .populate({
                path: "productId",
                select: "name image.url"
            })
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit),


        Orders.countDocuments({
            sellerId: userId,
            sellerRole: "farmer"
        })
    ]);


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    orders,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalOrders / limit),
                        totalOrders,
                        limit
                    }
                },
                "Received orders fetched successfully"
            )
        );
});

export const getFarmerReceiveOrderDetails = AsyncHandler(async (req, res) => {
    const userId = req.user._id
    const { orderId } = req.params
    if (!orderId) {
        throw new ApiErrors(400, "order id is required")
    }

    if (!mongoose.isValidObjectId(orderId)) {
        throw new ApiErrors(400, "invalid order id")
    }

    const redisKey = `productOrderDetails:farmer:${orderId}`

    const redisOrder = await redis.get(redisKey)
    let order

    if (redisOrder) {
        order = JSON.parse(redisOrder)
    } else {
        order = await Orders.findById(orderId)
            .select("sellerId buyerId productId quantity unit totalAmount status createdAt")
            .populate({
                path: "buyerId",
                select: "name phoneNumber email district"
            })
            .populate({
                path: "productId",
                select: "name category image.url"
            });
        await redis.set(redisKey,
            JSON.stringify(order),
            "EX", 300
        )
    }

    if (!order) {
        throw new ApiErrors(404, "order is not found")
    }

    if (order.sellerId.toString() !== userId.toString()) {
        throw new ApiErrors(401, "unauthorized access")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "order details fetch successfully")
        )
})

export const changeFarmerOrderStatus = AsyncHandler(async (req, res) => {
    const userId = req.user._id
    const { orderId } = req.params
    if (!orderId) {
        throw new ApiErrors(400, "order id is required")
    }

    const { status } = req.body
    if (!status) {
        throw new ApiErrors(400, "status are required")
    }

    if (!["PROCESSING", "SHIPPED", "DELIVERED"].includes(status)) {
        throw new ApiErrors(400, "invalid status")
    }

    const order = await Orders.findOneAndUpdate(
        {
            _id: orderId,
            sellerId: userId,
            sellerRole: "farmer"
        },
        {
            status: status
        }
    )

    if (!order) {
        throw new ApiErrors(404, "order not found")
    }

    await redis.del(`productOrderDetails:farmer:${orderId}`)
    await redis.del(`productOrderDetails:aratdar:${orderId}`)

    return res
        .status(200)
        .json(
            new ApiResponse(200, { orderId, status }, "order status change successfully")
        )
})

export const getAratdarPlacedOrder = AsyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const userId = req.user._id;

    const [orders, totalOrders] = await Promise.all([
        Orders.find({
            buyerId: userId,
            buyerRole: "aratdar"
        })
            .select(
                "productId quantity unit totalAmount status createdAt"
            )
            .populate({
                path: "productId",
                select: "name image.url"
            })
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit),


        Orders.countDocuments({
            buyerId: userId,
            buyerRole: "aratdar"
        })
    ]);


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    orders,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalOrders / limit),
                        totalOrders,
                        limit
                    }
                },
                "placed orders fetched successfully"
            )
        );
})

export const getAratdarPlacedOrderDetails = AsyncHandler(async (req, res) => {
    const userId = req.user._id
    const { orderId } = req.params
    if (!orderId) {
        throw new ApiErrors(400, "order id is required")
    }

    if (!mongoose.isValidObjectId(orderId)) {
        throw new ApiErrors(400, "invalid order id")
    }

    const redisKey = `productOrderDetails:aratdar:${orderId}`

    const redisOrder = await redis.get(redisKey)
    let order

    if (redisOrder) {
        order = JSON.parse(redisOrder)
    } else {
        order = await Orders.findById(orderId)
            .select("sellerId buyerId productId quantity unit totalAmount status createdAt")
            .populate({
                path: "sellerId",
                select: "name phoneNumber email"
            })
            .populate({
                path: "productId",
                select: "name category image.url district"
            });
        await redis.set(redisKey,
            JSON.stringify(order),
            "EX", 300
        )
    }

    if (!order) {
        throw new ApiErrors(404, "order is not found")
    }

    if (order.buyerId.toString() !== userId.toString()) {
        throw new ApiErrors(401, "unauthorized access")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "order details fetch successfully")
        )
})

export const getAratdarReceivedOrder = AsyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const userId = req.user._id;

    const [orders, totalOrders] = await Promise.all([
        Orders.find({
            sellerId: userId,
            sellerRole: "aratdar"
        })
            .select(
                "inventoryId quantity unit totalAmount status createdAt"
            )
            .populate({
                path: "inventoryId",
                select: "productName image.url"
            })
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit),


        Orders.countDocuments({
            sellerId: userId,
            sellerRole: "aratdar"
        })
    ]);


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    orders,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalOrders / limit),
                        totalOrders,
                        limit
                    }
                },
                "Received orders fetched successfully"
            )
        );
})

export const getAratdarReceiveOrderDetails = AsyncHandler(async (req, res) => {
    const userId = req.user._id
    const { orderId } = req.params
    if (!orderId) {
        throw new ApiErrors(400, "order id is required")
    }

    if (!mongoose.isValidObjectId(orderId)) {
        throw new ApiErrors(400, "invalid order id")
    }

    const redisKey = `inventoryOrderDetails:aratdar:${orderId}`

    const redisOrder = await redis.get(redisKey)
    let order

    if (redisOrder) {
        order = JSON.parse(redisOrder)
    } else {
        order = await Orders.findOne({
            _id: orderId,
            sellerId: userId,
            sellerRole: "aratdar"
        })
            .select("sellerId buyerId inventoryId quantity unit totalAmount status createdAt")
            .populate({
                path: "buyerId",
                select: "name phoneNumber email district"
            })
            .populate({
                path: "inventoryId",
                select: "productName category image.url"
            });

        await redis.set(redisKey,
            JSON.stringify(order),
            "EX", 300
        )
    }

    if (!order) {
        throw new ApiErrors(404, "order is not found")
    }

    if (order.sellerId.toString() !== userId.toString()) {
        throw new ApiErrors(403, "unauthorized access")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "order details fetch successfully")
        )
})

export const changeAratdarOrderStatus = AsyncHandler(async (req, res) => {
    const userId = req.user._id
    const { orderId } = req.params
    if (!orderId) {
        throw new ApiErrors(400, "order id is required")
    }

    const { status } = req.body
    if (!status) {
        throw new ApiErrors(400, "status are required")
    }

    if (!["PROCESSING", "SHIPPED", "DELIVERED"].includes(status)) {
        throw new ApiErrors(400, "invalid status")
    }

    const order = await Orders.findOneAndUpdate(
        {
            _id: orderId,
            sellerId: userId,
            sellerRole: "aratdar"
        },
        {
            status: status
        },
        {
            new: true,
        }
    )

    if (!order) {
        throw new ApiErrors(404, "order not found")
    }

    await redis.del(`inventoryOrderDetails:aratdar:${orderId}`)
    await redis.del(`inventoryOrderDetails:retailer:${orderId}`)

    return res
        .status(200)
        .json(
            new ApiResponse(200, { orderId, status }, "order status change successfully")
        )
})

export const getRetailerPlacedOrder = AsyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const userId = req.user._id;

    const [orders, totalOrders] = await Promise.all([
        Orders.find({
            buyerId: userId,
            buyerRole: "retailer"
        })
            .select(
                "inventoryId quantity unit totalAmount status createdAt"
            )
            .populate({
                path: "inventoryId",
                select: "productName image.url"
            })
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit),


        Orders.countDocuments({
            buyerId: userId,
            buyerRole: "retailer"
        })
    ]);


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    orders,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(totalOrders / limit),
                        totalOrders,
                        limit
                    }
                },
                "placed orders fetched successfully"
            )
        );
})

export const getRetailerPlacedOrderDetails = AsyncHandler(async (req, res) => {
    const userId = req.user._id
    const { orderId } = req.params
    if (!orderId) {
        throw new ApiErrors(400, "order id is required")
    }

    if (!mongoose.isValidObjectId(orderId)) {
        throw new ApiErrors(400, "invalid order id")
    }

    const redisKey = `inventoryOrderDetails:retailer:${orderId}`

    const redisOrder = await redis.get(redisKey)
    let order

    if (redisOrder) {
        order = JSON.parse(redisOrder)
    } else {
        order = await Orders.findById({
            _id: orderId,
            buyerId: userId,
            buyerRole: "retailer"
        })
            .select("sellerId buyerId inventoryId quantity unit totalAmount status createdAt")
            .populate({
                path: "sellerId",
                select: "name phoneNumber email"
            })
            .populate({
                path: "inventoryId",
                select: "productName category image.url"
            });
        await redis.set(redisKey,
            JSON.stringify(order),
            "EX", 300
        )
    }

    if (!order) {
        throw new ApiErrors(404, "order is not found")
    }

    if (order.buyerId.toString() !== userId.toString()) {
        throw new ApiErrors(403, "unauthorized access")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, order, "order details fetch successfully")
        )
})