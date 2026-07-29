export interface changeFarmerOrderStatusType {
    orderId: string
    stauts: "PROCESSING" | "SHIPPED" | "DELIVERED"
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