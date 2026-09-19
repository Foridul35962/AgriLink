import mongoose from "mongoose";
import redis from "../config/redis.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Auction from "../models/auctions.model.js";
import Orders from "../models/Order.model.js";
import Products from "../models/Product.model.js";
import ApiResponse from "../helpers/ApiResponse.js";
import ApiErrors from '../helpers/ApiErrors.js';
import Inventories from "../models/Inventory.model.js";

export const farmerDashboard = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const redisKey = `dashboard:farmer:${userId}`;

    const redisValue = await redis.get(redisKey);

    if (redisValue) {
        const value = JSON.parse(redisValue);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    value,
                    "farmer dashboard get successfully"
                )
            );
    }

    const currentYear = new Date().getFullYear();

    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const startOfNextYear = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);

    const [
        cropStats,
        orderStats,
        monthlySales,
        monthlyOrders,
        auctionStats,
        recentOrders,
        activeAuctions
    ] = await Promise.all([
        Products.aggregate([
            {
                $match: {
                    farmerId: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: null,

                    totalCrops: {
                        $sum: 1
                    },

                    availableCrops: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $eq: ["$status", "available"]
                                        },
                                        {
                                            $gte: [
                                                "$createdAt",
                                                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                            ]
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    soldCrops: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "sold"] },
                                1,
                                0
                            ]
                        }
                    },

                    expiredCrops: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        {
                                            $ne: ["$status", "sold"]
                                        },
                                        {
                                            $lte: [
                                                "$createdAt",
                                                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                            ]
                                        }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]),

        //order

        Orders.aggregate([
            {
                $match: {
                    sellerId: new mongoose.Types.ObjectId(userId),
                    sellerRole: "farmer"
                }
            },
            {
                $group: {
                    _id: null,

                    totalOrders: {
                        $sum: 1
                    },

                    pendingOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        "$status",
                                        ["PENDING", "CONFIRMED", "PROCESSING"]
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    deliveredOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "DELIVERED"]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    cancelledOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "CANCELLED"]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    totalSales: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "DELIVERED"]
                                },
                                "$totalAmount",
                                0
                            ]
                        }
                    }
                }
            }
        ]),

        // MONTHLY SALES

        Orders.aggregate([
            {
                $match: {
                    sellerId: new mongoose.Types.ObjectId(userId),
                    sellerRole: "farmer",
                    status: "DELIVERED",

                    createdAt: {
                        $gte: startOfYear,
                        $lt: startOfNextYear
                    }
                }
            },

            {
                $group: {
                    _id: {
                        $month: {
                            date: "$createdAt",
                            timezone: "Asia/Dhaka"
                        }
                    },

                    sales: {
                        $sum: "$totalAmount"
                    },

                    orders: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    "_id": 1
                }
            }
        ]),

        // MONTHLY ORDERS

        Orders.aggregate([
            {
                $match: {
                    sellerId: new mongoose.Types.ObjectId(userId),
                    sellerRole: "farmer",

                    createdAt: {
                        $gte: startOfYear,
                        $lt: startOfNextYear
                    }
                }
            },

            {
                $group: {
                    _id: {
                        $month: {
                            date: "$createdAt",
                            timezone: "Asia/Dhaka"
                        }
                    },

                    orders: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    "_id": 1
                }
            }
        ]),

        // AUCTION STATS

        Auction.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },

            {
                $unwind: "$product"
            },

            {
                $match: {
                    "product.farmerId": new mongoose.Types.ObjectId(userId)
                }
            },

            {
                $group: {
                    _id: null,

                    totalAuctions: {
                        $sum: 1
                    },

                    activeAuctions: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: ["$status", "ACTIVE"]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    waitingSelection: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "WAITING_FARMER_SELECTION"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    completedAuctions: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "ORDER_CREATED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]),

        // RECENT ORDERS

        Orders.find({
            sellerId: userId,
            sellerRole: "farmer"
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select(
                "buyerId productId quantity unit pricePerUnit totalAmount status createdAt"
            )
            .populate("buyerId", "name email phone")
            .populate("productId", "name image.url")
            .lean(),

        // ACTIVE AUCTIONS

        Auction.aggregate([
            {
                $match: {
                    status: "ACTIVE"
                }
            },

            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product"
                }
            },

            {
                $unwind: "$product"
            },

            {
                $match: {
                    "product.farmerId": new mongoose.Types.ObjectId(userId)
                }
            },

            {
                $project: {
                    _id: 1,
                    productId: 1,
                    startPrice: 1,
                    currentHighestBid: 1,
                    highestBidder: 1,
                    startTime: 1,
                    endTime: 1,
                    status: 1,

                    productName: "$product.name",
                    productImage: "$product.image.url"
                }
            },

            {
                $sort: {
                    endTime: 1
                }
            },

            {
                $limit: 5
            }
        ])
    ]);

    // 4. MONTHLY DATA FORMAT

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const salesMap = new Map(
        monthlySales.map(item => [
            item._id,
            {
                sales: item.sales,
                orders: item.orders
            }
        ])
    );

    const ordersMap = new Map(
        monthlyOrders.map(item => [
            item._id,
            item.orders
        ])
    );

    const monthlyData = monthNames.map((month, index) => {
        const monthNumber = index + 1;

        return {
            month,
            sales: salesMap.get(monthNumber)?.sales || 0,
            orders: ordersMap.get(monthNumber) || 0
        };
    });

    // 5. DEFAULT STATS

    const crop = cropStats[0] || {
        totalCrops: 0,
        availableCrops: 0,
        soldCrops: 0,
        expiredCrops: 0
    };

    const order = orderStats[0] || {
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalSales: 0
    };

    const auction = auctionStats[0] || {
        totalAuctions: 0,
        activeAuctions: 0,
        waitingSelection: 0,
        completedAuctions: 0
    };

    // 6. FINAL RESPONSE

    const dashboardData = {

        summary: {
            totalCrops: crop.totalCrops,
            availableCrops: crop.availableCrops,

            totalOrders: order.totalOrders,
            pendingOrders: order.pendingOrders,
            deliveredOrders: order.deliveredOrders,

            totalSales: order.totalSales,

            totalAuctions: auction.totalAuctions,
            activeAuctions: auction.activeAuctions,

            waitingAuctionSelection: auction.waitingSelection,
            completedAuctions: auction.completedAuctions
        },

        cropStats: {
            total: crop.totalCrops,
            available: crop.availableCrops,
            sold: crop.soldCrops,
            expired: crop.expiredCrops
        },

        orderStats: {
            total: order.totalOrders,
            pending: order.pendingOrders,
            delivered: order.deliveredOrders,
            cancelled: order.cancelledOrders
        },

        monthlyData,

        recentOrders,

        activeAuctions
    };

    await redis.set(
        redisKey,
        JSON.stringify(dashboardData),
        "EX",
        600
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                dashboardData,
                "farmer dashboard get successfully"
            )
        );
});

export const aratdarDashboard = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const redisKey = `dashboard:aratdar:${userId}`;
    const redisValue = await redis.get(redisKey);
    if (redisValue) {
        const value = JSON.parse(redisValue);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    value,
                    "aratdar dashboard get successfully"
                )
            );
    }

    const currentYear = new Date().getFullYear();

    const startOfYear = new Date( `${currentYear}-01-01T00:00:00.000Z` );

    const startOfNextYear = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [
        inventoryStats,
        orderStats,
        monthlyPurchase,
        monthlySales,
        recentPurchases,
        recentSales,
        inventoryList
    ] = await Promise.all([

        // ======================================
        // 1. INVENTORY STATS
        // ======================================

        Inventories.aggregate([

            {
                $match: {
                    aratdarId: userObjectId
                }
            },

            {
                $project: {

                    totalQuantity: 1,
                    allocatedQuantity: 1,
                    status: 1,

                    availableQuantity: {
                        $subtract: [
                            "$totalQuantity",
                            "$allocatedQuantity"
                        ]
                    }
                }
            },

            {
                $group: {

                    _id: null,

                    totalInventoryItems: {
                        $sum: 1
                    },

                    availableInventoryItems: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "available"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    depletedInventoryItems: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "depleted"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    totalQuantity: {
                        $sum: "$totalQuantity"
                    },

                    totalAllocatedQuantity: {
                        $sum: "$allocatedQuantity"
                    },

                    lowStockItems: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [

                                        {
                                            $gt: [
                                                "$totalQuantity",
                                                0
                                            ]
                                        },

                                        {
                                            $lte: [
                                                "$availableQuantity",

                                                {
                                                    $multiply: [
                                                        "$totalQuantity",
                                                        0.20
                                                    ]
                                                }
                                            ]
                                        },

                                        {
                                            $gt: [
                                                "$availableQuantity",
                                                0
                                            ]
                                        }
                                    ]
                                },

                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]),

        // ======================================
        // 2. ORDER STATS
        // ======================================

        Orders.aggregate([

            {
                $match: {
                    $or: [

                        // Farmer → Aratdar
                        {
                            buyerId: userObjectId,
                            buyerRole: "aratdar",
                            sellerRole: "farmer"
                        },

                        // Aratdar → Retailer
                        {
                            sellerId: userObjectId,
                            sellerRole: "aratdar",
                            buyerRole: "retailer"
                        }

                    ]
                }
            },

            {
                $group: {

                    _id: null,

                    totalOrders: {
                        $sum: 1
                    },

                    pendingOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        "$status",
                                        [
                                            "PENDING",
                                            "CONFIRMED",
                                            "PROCESSING"
                                        ]
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    deliveredOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "DELIVERED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },

                    cancelledOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$status",
                                        "CANCELLED"
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]),

        // ======================================
        // 3. MONTHLY PURCHASE
        // Farmer → Aratdar
        // ======================================

        Orders.aggregate([

            {
                $match: {

                    buyerId: userObjectId,

                    buyerRole: "aratdar",

                    sellerRole: "farmer",

                    status: {
                        $ne: "CANCELLED"
                    },

                    createdAt: {
                        $gte: startOfYear,
                        $lt: startOfNextYear
                    }
                }
            },

            {
                $group: {

                    _id: {
                        $month: {
                            date: "$createdAt",
                            timezone: "Asia/Dhaka"
                        }
                    },

                    purchase: {
                        $sum: "$totalAmount"
                    },

                    orders: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    "_id": 1
                }
            }
        ]),

        // ======================================
        // 4. MONTHLY SALES
        // Aratdar → Retailer
        // ======================================

        Orders.aggregate([
            {
                $match: {
                    sellerId: userObjectId,
                    sellerRole: "aratdar",
                    buyerRole: "retailer",
                    status: {
                        $ne: "CANCELLED"
                    },
                    createdAt: {
                        $gte: startOfYear,
                        $lt: startOfNextYear
                    }
                }
            },

            {
                $group: {

                    _id: {
                        $month: {
                            date: "$createdAt",
                            timezone: "Asia/Dhaka"
                        }
                    },

                    sales: {
                        $sum: "$totalAmount"
                    },

                    orders: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    "_id": 1
                }
            }
        ]),

        // 5. RECENT PURCHASES

        Orders.find({
            buyerId: userId,
            buyerRole: "aratdar",
            sellerRole: "farmer"

        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select(
                "sellerId productId quantity unit pricePerUnit totalAmount status createdAt"
            )
            .populate(
                "sellerId",
                "name email phone"
            )
            .populate(
                "productId",
                "name image.url"
            )
            .lean(),

        // 6. RECENT SALES

        Orders.find({
            sellerId: userId,
            sellerRole: "aratdar",
            buyerRole: "retailer"

        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select(
                "buyerId inventoryId quantity unit pricePerUnit totalAmount status createdAt"
            )
            .populate(
                "buyerId",
                "name email phone"
            )
            .populate(
                "inventoryId",
                "productName image.url"
            )
            .lean(),

        // 7. INVENTORY LIST

        Inventories.find({
            aratdarId: userId
        })
            .select(
                "productName category totalQuantity allocatedQuantity pricePerUnit unit image.url status"
            )
            .sort({
                createdAt: -1
            })
            .limit(10)
            .lean()

    ]);

    // MONTH NAMES

    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    // PURCHASE MAP

    const purchaseMap = new Map(
        monthlyPurchase.map(item => [
            item._id,
            {
                purchase: item.purchase,
                orders: item.orders
            }
        ])
    );

    // SALES MAP

    const salesMap = new Map(
        monthlySales.map(item => [
            item._id,
            {
                sales: item.sales,
                orders: item.orders
            }
        ])
    );

    // MONTHLY DATA
    const monthlyData = monthNames.map(
        (month, index) => {
            const monthNumber = index + 1;
            return {
                month,
                purchase: purchaseMap.get(monthNumber)?.purchase || 0,
                purchaseOrders: purchaseMap.get(monthNumber)?.orders || 0,
                sales: salesMap.get(monthNumber)?.sales || 0,
                salesOrders: salesMap.get(monthNumber)?.orders || 0
            };
        }
    );

    // DEFAULT INVENTORY STATS

    const inventory = inventoryStats[0] || {
        totalInventoryItems: 0,
        availableInventoryItems: 0,
        depletedInventoryItems: 0,
        totalQuantity: 0,
        totalAllocatedQuantity: 0,
        lowStockItems: 0
    };

    // DEFAULT ORDER STATS
    const orders = orderStats[0] || {
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
    };

    // TOTAL PURCHASE

    const totalPurchase = monthlyData.reduce(
        (total, item) => total + item.purchase,
        0
    );

    // TOTAL SALES

    const totalSales = monthlyData.reduce(
        (total, item) => total + item.sales,
        0
    );

    const dashboardData = {
        summary: {
            totalInventoryItems: inventory.totalInventoryItems,
            availableInventoryItems: inventory.availableInventoryItems,
            depletedInventoryItems: inventory.depletedInventoryItems,
            totalQuantity: inventory.totalQuantity,
            totalAllocatedQuantity: inventory.totalAllocatedQuantity,
            lowStockItems: inventory.lowStockItems,
            totalPurchase,
            totalSales,
            totalOrders: orders.totalOrders,
            pendingOrders: orders.pendingOrders,
            deliveredOrders: orders.deliveredOrders,
            cancelledOrders: orders.cancelledOrders
        },

        inventoryStats: {
            totalItems: inventory.totalInventoryItems,
            available: inventory.availableInventoryItems,
            depleted: inventory.depletedInventoryItems,
            totalQuantity: inventory.totalQuantity,
            allocatedQuantity: inventory.totalAllocatedQuantity,
            lowStock: inventory.lowStockItems
        },

        orderStats: {
            total: orders.totalOrders,
            pending: orders.pendingOrders,
            delivered: orders.deliveredOrders,
            cancelled: orders.cancelledOrders
        },
        monthlyData,
        recentPurchases,
        recentSales,
        inventoryList
    };

    await redis.set(
        redisKey,
        JSON.stringify(dashboardData),
        "EX",
        600
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                dashboardData,
                "aratdar dashboard get successfully"
            )
        );
});