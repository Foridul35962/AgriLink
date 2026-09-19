import { AratdarDashboardResponse, FarmerDashboardResponse } from "@/types/dashboardType";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/dashboard`

export const getfarmerDashboard = createAsyncThunk(
    "dashboard/farmer",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/farmer`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAratdarDashboard = createAsyncThunk(
    "dashboard/aratdar",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/aratdar`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType {
    dashboardLoading: boolean
    dashboardFetch: boolean
    farmerDashboard: FarmerDashboardResponse
    aratdarDashboard: AratdarDashboardResponse
}

const initialState: initialStateType = {
    dashboardLoading: false,
    dashboardFetch: false,
    farmerDashboard: {
        summary: {
            totalCrops: 0,
            availableCrops: 0,

            totalOrders: 0,
            pendingOrders: 0,
            deliveredOrders: 0,

            totalSales: 0,

            totalAuctions: 0,
            activeAuctions: 0,

            waitingAuctionSelection: 0,
            completedAuctions: 0,
        },

        cropStats: {
            total: 0,
            available: 0,
            sold: 0,
            expired: 0,
        },

        orderStats: {
            total: 0,
            pending: 0,
            delivered: 0,
            cancelled: 0,
        },

        activeAuctions: [],
        monthlyData: [],
        recentOrders: []
    },
    aratdarDashboard: {
        summary: {
            totalInventoryItems: 0,
            availableInventoryItems: 0,
            depletedInventoryItems: 0,

            totalQuantity: 0,
            totalAllocatedQuantity: 0,

            lowStockItems: 0,

            totalPurchase: 0,
            totalSales: 0,

            totalOrders: 0,
            pendingOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
        },

        inventoryStats: {
            totalItems: 0,
            available: 0,
            depleted: 0,

            totalQuantity: 0,
            allocatedQuantity: 0,

            lowStock: 0,
        },

        orderStats: {
            total: 0,
            pending: 0,
            delivered: 0,
            cancelled: 0,
        },
        inventoryList: [],
        monthlyData: [],
        recentPurchases: [],
        recentSales: []
    }
}

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //farmer
        builder
            .addCase(getfarmerDashboard.pending, (state) => {
                state.dashboardLoading = true
            })
            .addCase(getfarmerDashboard.fulfilled, (state, action) => {
                state.dashboardLoading = false
                state.dashboardFetch = true
                state.farmerDashboard = action.payload.data
            })
            .addCase(getfarmerDashboard.rejected, (state) => {
                state.dashboardLoading = false
                state.dashboardFetch = true
            })
        //aratdar
        builder
            .addCase(getAratdarDashboard.pending, (state) => {
                state.dashboardLoading = true
            })
            .addCase(getAratdarDashboard.fulfilled, (state, action) => {
                state.dashboardLoading = false
                state.dashboardFetch = true
                state.aratdarDashboard = action.payload.data
            })
            .addCase(getAratdarDashboard.rejected, (state) => {
                state.dashboardLoading = false
                state.dashboardFetch = true
            })
    },
})

export default dashboardSlice.reducer