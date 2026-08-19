import mongoose from "mongoose";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Orders from "../models/Order.model.js";
import ApiResponse from "../helpers/ApiResponse.js";
import redis from "../config/redis.js";
import Inventories from "../models/Inventory.model.js";

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
    const userId = req.user._id;
    const { orderId } = req.params;

    // Validate orderId
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
        throw new ApiErrors(400, "Invalid order id");
    }

    const { status } = req.body;

    // Validate status
    if (!status) {
        throw new ApiErrors(400, "Status is required");
    }

    if (!["PROCESSING", "SHIPPED", "DELIVERED"].includes(status)) {
        throw new ApiErrors(400, "Invalid status");
    }

    // Find order belonging to this aratdar
    const order = await Orders.findOne({
        _id: orderId,
        sellerId: userId,
        sellerRole: "aratdar"
    });

    if (!order) {
        throw new ApiErrors(404, "Order not found");
    }

    // Cancelled order cannot be updated
    if (order.status === "CANCELLED") {
        throw new ApiErrors(
            400,
            "Cancelled order status cannot be changed"
        );
    }

    // Delivered order cannot move to another status
    if (order.status === "DELIVERED") {
        throw new ApiErrors(
            400,
            "Delivered order status cannot be changed"
        );
    }

    // Validate status transition
    const validTransitions = {
        PENDING: ["PROCESSING"],
        PROCESSING: ["SHIPPED"],
        SHIPPED: ["DELIVERED"]
    };

    if (!validTransitions[order.status]?.includes(status)) {
        throw new ApiErrors(
            400,
            `Cannot change order status from ${order.status} to ${status}`
        );
    }

    // Update order status
    order.status = status;

    await order.save();

    // Clear Redis cache
    await Promise.all([
        redis.del(`inventoryOrderDetails:aratdar:${orderId}`),
        redis.del(`inventoryOrderDetails:retailer:${orderId}`)
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    orderId: order._id,
                    status: order.status
                },
                "Order status changed successfully"
            )
        );
});

export const getRetailerPlacedOrder = AsyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const userId = req.user._id;

    const [orders, totalOrders] = await Promise.all([
        Orders.find({
            buyerId: userId,
            buyerRole: "retailer",
            status: {
                $ne: "CANCELLED"
            }
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

export const cancelReailerOrder = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const { orderId, productId, cancelReason } = req.body;

    // Validate cancel reason
    if (!cancelReason?.trim()) {
        throw new ApiErrors(400, "Cancel reason is required");
    }

    // Validate orderId
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
        throw new ApiErrors(400, "Invalid orderId");
    }

    // Validate productId
    if (!productId || !mongoose.isValidObjectId(productId)) {
        throw new ApiErrors(400, "Invalid productId");
    }

    // Find order and inventory
    const [order, product] = await Promise.all([
        Orders.findById(orderId),
        Inventories.findById(productId)
    ]);

    if (!order) {
        throw new ApiErrors(404, "Order is not found");
    }

    if (!product) {
        throw new ApiErrors(404, "Product is not found");
    }

    // Check buyer ownership
    if (order.buyerId.toString() !== userId.toString()) {
        throw new ApiErrors(403, "Unauthorized access");
    }

    // Only pending order can be cancelled
    if (order.status !== "PENDING") {
        throw new ApiErrors(
            400,
            "Order cannot be cancelled at this time"
        );
    }

    // Make sure the order belongs to this inventory
    if (order.inventoryId.toString() !== productId.toString()) {
        throw new ApiErrors(
            400,
            "This order does not belong to this product"
        );
    }

    // const session = await mongoose.startSession();

    try {
        // await session.startTransaction();

        await Inventories.updateOne(
            {
                _id: productId
            },
            {
                $inc: {
                    allocatedQuantity: -order.quantity
                },

                $set: {
                    status: "available"
                }
            },
            // {
            //     session
            // }
        );

        await Orders.updateOne(
            {
                _id: orderId,
                status: "PENDING"
            },
            {
                $set: {
                    status: "CANCELLED",
                    cancelReason
                }
            },
            // {
            //     session
            // }
        );

        // await session.commitTransaction();

        await Promise.all([
            redis.del(`inventoryOrderDetails:aratdar:${orderId}`),
            redis.del(`inventoryOrderDetails:retailer:${orderId}`)
        ]);
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { orderId, cancelReason },
                    "Order cancelled successfully"
                )
            );

    } catch (error) {
        // await session.abortTransaction();

        throw error;

    } finally {
        // await session.endSession();
    }
});