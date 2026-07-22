export interface RequestedUser {
    _id: string;
    name: string;
    email?: string;
    role: "farmer" | "aratdar" | "retailer";
    phoneNumber?: string;
    district: string;
}

export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
}

export interface GetUsersRequestResponse {
    users: RequestedUser[];
    pagination: Pagination;
}