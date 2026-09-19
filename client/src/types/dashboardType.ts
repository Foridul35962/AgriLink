export interface FarmerDashboardResponse {
    summary: {
        totalCrops: number;
        availableCrops: number;

        totalOrders: number;
        pendingOrders: number;
        deliveredOrders: number;

        totalSales: number;

        totalAuctions: number;
        activeAuctions: number;

        waitingAuctionSelection: number;
        completedAuctions: number;
    };

    cropStats: {
        total: number;
        available: number;
        sold: number;
        expired: number;
    };

    orderStats: {
        total: number;
        pending: number;
        delivered: number;
        cancelled: number;
    };

    monthlyData: {
        month: string;
        sales: number;
        orders: number;
    }[];

    recentOrders: {
        _id: string;

        buyerId: {
            _id: string;
            name: string;
            email: string;
            phone: string;
        };

        productId: {
            _id: string;
            name: string;
            image?: {
                url: string;
            };
        };

        quantity: number;
        unit: "kg" | "mon" | "ton" | "piece";
        pricePerUnit: number;
        totalAmount: number;

        status:
            | "PENDING"
            | "CONFIRMED"
            | "PROCESSING"
            | "SHIPPED"
            | "DELIVERED"
            | "CANCELLED";

        createdAt: string;
    }[];

    activeAuctions: {
        _id: string;

        productId: string;

        startPrice: number;
        currentHighestBid: number;

        highestBidder: string | null;

        startTime: string;
        endTime: string;

        status: "ACTIVE";

        productName: string;

        productImage?: string;
    }[];
}

export interface AratdarDashboardResponse {
    summary: {
        totalInventoryItems: number;
        availableInventoryItems: number;
        depletedInventoryItems: number;

        totalQuantity: number;
        totalAllocatedQuantity: number;

        lowStockItems: number;

        totalPurchase: number;
        totalSales: number;

        totalOrders: number;
        pendingOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
    };

    inventoryStats: {
        totalItems: number;
        available: number;
        depleted: number;

        totalQuantity: number;
        allocatedQuantity: number;

        lowStock: number;
    };

    orderStats: {
        total: number;
        pending: number;
        delivered: number;
        cancelled: number;
    };

    monthlyData: {
        month: string;

        purchase: number;
        purchaseOrders: number;

        sales: number;
        salesOrders: number;
    }[];

    recentPurchases: {
        _id: string;

        sellerId: {
            _id: string;
            name: string;
            email: string;
            phone: string;
        };

        productId: {
            _id: string;
            name: string;

            image?: {
                url?: string;
            };
        };

        quantity: number;

        unit:
            | "kg"
            | "mon"
            | "ton"
            | "piece";

        pricePerUnit: number;

        totalAmount: number;

        status:
            | "PENDING"
            | "CONFIRMED"
            | "PROCESSING"
            | "SHIPPED"
            | "DELIVERED"
            | "CANCELLED";

        createdAt: string;
    }[];

    recentSales: {
        _id: string;

        buyerId: {
            _id: string;
            name: string;
            email: string;
            phone: string;
        };

        inventoryId: {
            _id: string;
            productName: string;

            image?: {
                url?: string;
            };
        };

        quantity: number;

        unit:
            | "kg"
            | "mon"
            | "ton"
            | "piece";

        pricePerUnit: number;

        totalAmount: number;

        status:
            | "PENDING"
            | "CONFIRMED"
            | "PROCESSING"
            | "SHIPPED"
            | "DELIVERED"
            | "CANCELLED";

        createdAt: string;
    }[];

    inventoryList: {
        _id: string;

        productName: string;

        category: string;

        totalQuantity: number;

        allocatedQuantity: number;

        pricePerUnit: number;

        unit:
            | "kg"
            | "mon"
            | "ton"
            | "piece";

        image?: {
            url?: string;
        };

        status:
            | "available"
            | "depleted";
    }[];
}