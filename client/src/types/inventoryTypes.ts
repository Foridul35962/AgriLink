export interface InventoryImage {
    url: string;
}

export interface Inventory {
    _id: string;
    aratdarId?: string;
    productName: string;
    category: string;
    totalQuantity: number;
    allocatedQuantity: number;
    pricePerUnit: number;
    unit: "kg" | "mon" | "ton" | "piece";
    image: InventoryImage;
    description?: string;
    status: "available" | "depleted";
    createdAt?: string;
    updatedAt?: string;
}


export interface MyInventoriesResponse {
    inventories: Inventory[];
    pagination: {
        currentPage: number;
        limit: number;
        totalInventories: number;
        totalPages: number;
    };
}

export interface AllInventoriesResponse {
    inventory: Inventory[];
    pagination: {
        currentPage: number;
        limit: number;
        totalInventories: number;
        totalPages: number;
    };
};