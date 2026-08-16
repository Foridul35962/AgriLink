export interface changeFarmerOrderStatusType {
    orderId: string
    status: "PROCESSING" | "SHIPPED" | "DELIVERED"
}

// --------------------------------
// Common Types
// --------------------------------

export type OrderUnit = "kg" | "mon" | "ton" | "piece";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  limit: number;
}

// ===================================================================
// getFarmerReceiveOrder()
// ===================================================================

export interface FarmerReceiveOrder {
  _id: string;
  quantity: number;
  unit: OrderUnit;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;

  productId: {
    _id: string;
    name: string;
    image: {
      url: string;
    };
  };
}

export interface FarmerReceiveOrderResponse {
  orders: FarmerReceiveOrder[];
  pagination: Pagination;
}

// ===================================================================
// getFarmerReceiveOrderDetails()
// ===================================================================

export interface FarmerReceiveOrderDetailsResponse {
  _id: string;

  sellerId: string;

  buyerId: {
    _id: string;
    name: string;
    phoneNumber: string;
    email?: string;
    district: string;
  };

  productId: {
    _id: string;
    name: string;
    category: string;
    image: {
      url: string;
    };
  };

  quantity: number;
  unit: OrderUnit;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}


// ===================================================================
// getAratdarPlacedOrder()
// ===================================================================

export interface AratdarPlacedOrder {
  _id: string;
  quantity: number;
  unit: OrderUnit;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;

  productId: {
    _id: string;
    name: string;
    image: {
      url: string;
    };
  };
}

export interface AratdarPlacedOrderResponse {
  orders: AratdarPlacedOrder[];
  pagination: Pagination;
}

// ===================================================================
// getAratdarPlacedOrderDetails()
// ===================================================================

export interface AratdarPlacedOrderDetailsResponse {
  _id: string;

  sellerId: {
    _id: string;
    name: string;
    phoneNumber: string;
    email?: string;
  };

  buyerId: string;

  productId: {
    _id: string;
    name: string;
    category: string;
    district: string;
    image: {
      url: string;
    };
  };

  quantity: number;
  unit: OrderUnit;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}


// ===================================================================
// getAratdarReceivedOrder()
// ===================================================================

export interface AratdarReceivedOrder {
  _id: string;
  quantity: number;
  unit: OrderUnit;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;

  inventoryId: {
    _id: string;
    productName: string;
    image: {
      url: string;
    };
  };
}

export interface AratdarReceivedOrderResponse {
  orders: AratdarReceivedOrder[];
  pagination: Pagination;
}


// ===================================================================
// getAratdarReceiveOrderDetails()
// ===================================================================

export interface AratdarReceiveOrderDetailsResponse {
  _id: string;

  sellerId: string;

  buyerId: {
    _id: string;
    name: string;
    phoneNumber: string;
    email?: string;
    district: string;
  };

  inventoryId: {
    _id: string;
    productName: string;
    category: string;
    image: {
      url: string;
    };
  };

  quantity: number;
  unit: OrderUnit;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}


// ===================================================================
// changeAratdarOrderStatus()
// ===================================================================

export interface ChangeAratdarOrderStatusResponse {
  orderId: string;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED";
}


// ===================================================================
// getRetailerPlacedOrder()
// ===================================================================

export interface RetailerPlacedOrder {
  _id: string;
  quantity: number;
  unit: OrderUnit;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;

  inventoryId: {
    _id: string;
    productName: string;
    image: {
      url: string;
    };
  };
}

export interface RetailerPlacedOrderResponse {
  orders: RetailerPlacedOrder[];
  pagination: Pagination;
}


// ===================================================================
// getRetailerPlacedOrderDetails()
// ===================================================================

export interface RetailerPlacedOrderDetailsResponse {
  _id: string;

  sellerId: {
    _id: string;
    name: string;
    phoneNumber: string;
    email?: string;
  };

  buyerId: string;

  inventoryId: {
    _id: string;
    productName: string;
    category: string;
    image: {
      url: string;
    };
  };

  quantity: number;
  unit: OrderUnit;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}


// ===================================================================
// createInventoryOrder()
// ===================================================================

export interface CreateInventoryOrderResponse {
  _id: string;

  sellerId: {
    _id: string;
    name: string;
    phoneNumber: string;
    email?: string;
  };

  buyerId: string;

  sellerRole: "aratdar";
  buyerRole: "retailer";

  inventoryId: {
    _id: string;
    productName: string;
    category: string;
    image: {
      url: string;
    };
  };

  quantity: number;
  pricePerUnit: number;
  unit: OrderUnit;
  totalAmount: number;
  status: OrderStatus;

  createdAt: string;
  updatedAt?: string;
}