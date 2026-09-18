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

export interface MonthlyChartData {
    _id: number;
    count: number;
}

export interface OrderStatusChartData {
    _id: string;
    count: number;
}

export interface UserRoleChartData {
    _id: "farmer" | "aratdar" | "retailer" | "admin";
    count: number;
}

export interface RecentOrder {
    _id: string;
    sellerRole: "farmer" | "aratdar";
    buyerRole: "aratdar" | "retailer";
    status: string;
    createdAt: string;
}

export interface AdminDashboardCharts {
    monthlyUsers: MonthlyChartData[];
    monthlyOrders: MonthlyChartData[];
    orderStatus: OrderStatusChartData[];
    userRoles: UserRoleChartData[];
}

export interface AdminDashboardData {
    totalUsers: number;
    farmers: number;
    aratdars: number;
    retailers: number;
    products: number;
    inventories: number;
    activeAuctions: number;
    orders: number;
    pendingReports: number;
    pendingMemberRequest: number;

    charts: AdminDashboardCharts;

    recentOrders: RecentOrder[];
}