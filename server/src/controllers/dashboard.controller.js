import mongoose from "mongoose";
import redis from "../config/redis.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Auction from "../models/auctions.model.js";
import Orders from "../models/Order.model.js";
import Products from "../models/Product.model.js";
import ApiResponse from "../helpers/ApiResponse.js";
import ApiErrors from '../helpers/ApiErrors.js';

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