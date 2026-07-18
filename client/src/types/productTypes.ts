export interface addBidType {
    auctionId: string
    bidAmount: number
}

export interface acceptBidType{
    auctionId:string
    bidId:string
}

export interface AddProductResponse {
  product: Product;
  auction: Auction;
}

export interface EditProductResponse {
  _id: string;
  farmerId: string;
  auctionId: string;
  name: string;
  category: string;
  quantity: number;
  unit: "kg" | "mon" | "ton" | "piece";
  pricePerUnit: number;
  district: string;
  harvestDate: string;
  image: {
    url: string;
  };
  description?: string;
  status: "available" | "sold" | "expired";
  createdAt: string;
  updatedAt: string;
}

export type DeleteProductResponse = string;

export interface GetAllMyProductsResponse {
  products: {
    _id: string;
    name: string;
    category: string;
    status: "available" | "sold" | "expired";
    pricePerUnit: number;
    quantity: number;
    unit: "kg" | "mon" | "ton" | "piece";
    image: {
      url: string;
    };
  }[];

  pagination: {
    currentPage: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
  };
}

export interface GetProductResponse {
  product: ProductDetails;
  auction: Auction;
  topBids: Bid[];
  winner: {
    bidAmount: number;
    aratdar: {
      _id: string;
      name: string;
      phoneNumber: string;
      district: string;
    };
  } | null;
}

export interface GetAllProductsResponse {
  products: {
    _id: string;
    name: string;
    category: string;
    pricePerUnit: number;
    quantity: number;
    unit: "kg" | "mon" | "ton" | "piece";
    image: {
      url: string;
    };
  }[];

  pagination: {
    currentPage: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
  };
}

export interface AddBiddingResponse {
  bidId: string;
  bidAmount: number;
  auctionId: string;
  currentHighestBid: number;
}

export interface AcceptBiddingResponse {
  bid: Bid;
  auction: Auction;
}


export interface Product {
  _id: string;
  farmerId: string | {
    _id: string;
    name: string;
    phoneNumber: string;
    district: string;
  };
  auctionId: string;
  name: string;
  category: string;
  quantity: number;
  unit: "kg" | "mon" | "ton" | "piece";
  pricePerUnit: number;
  district: string;
  harvestDate: string;
  image: {
    url: string;
  };
  description?: string;
  status: "available" | "sold" | "expired";
  createdAt: string;
  updatedAt: string;
}


export interface ProductDetails extends Omit<Product, 'auctionId'> {
  farmerId: {
    _id: string;
    name: string;
    phoneNumber: string;
    district: string;
  };

  auctionId: Auction;
}


export interface Auction {
  _id: string;
  productId: string | Product;
  startPrice: number;
  currentHighestBid: number;
  highestBidder: string | null;
  startTime: string;
  endTime: string;

  status:
    | "ACTIVE"
    | "ENDED"
    | "WAITING_FARMER_SELECTION"
    | "WINNER_SELECTED"
    | "ORDER_CREATED"
    | "CANCELLED";

  winnerBidId: string | null;
  selectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}


export interface Bid {
  _id: string;
  auctionId: string;

  aratdarId:
    | string
    | {
        _id: string;
        name: string;
        phoneNumber: string;
        district: string;
        email?: string;
      };

  bidAmount: number;

  status:
    | "PLACED"
    | "WINNER"
    | "LOST"
    | "CANCELLED";

  createdAt: string;
  updatedAt: string;
}