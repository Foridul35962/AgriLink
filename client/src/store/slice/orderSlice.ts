import { AratdarPlacedOrderDetailsResponse, AratdarPlacedOrderResponse, AratdarReceivedOrderResponse, AratdarReceiveOrderDetailsResponse, cancelOrderType, changeFarmerOrderStatusType, CreateInventoryOrderResponse, FarmerReceiveOrderDetailsResponse, FarmerReceiveOrderResponse, RetailerPlacedOrderDetailsResponse, RetailerPlacedOrderResponse } from "@/types/orderTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { createOrder } from "./productSlice";
import { createInventoryOrder } from "./inventorySlice";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/order`

export const getFarmerReceiveOrders = createAsyncThunk(
    "order/farmerReceive",
    async (params: { page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/farmer-receive`, {
                withCredentials: true,
                params
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getFarmerReceiveOrderDetails = createAsyncThunk(
    "order/farmerReceiveDetails",
    async ({ orderId }: { orderId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/farmer-receive-details/${orderId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const changeFarmerOrderStatus = createAsyncThunk(
    "order/farmerChangeStatus",
    async (data: changeFarmerOrderStatusType, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/farmer-change-status/${data.orderId}`, data,
                {
                    withCredentials: true
                }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAratdarPlacedOrders = createAsyncThunk(
    "order/aratdarPlaced",
    async (params: { page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/aratdar-placed`, {
                withCredentials: true,
                params
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAratdarPlacedOrderDetails = createAsyncThunk(
    "order/aratdarPlacedDetails",
    async ({ orderId }: { orderId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/farmer-placed-details/${orderId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAratdarReceiveOrder = createAsyncThunk(
    "order/aratdarRecived",
    async (params: { page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/aratdar-received`, {
                withCredentials: true,
                params
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAratdarReceiveOrderDetails = createAsyncThunk(
    "order/aratdarReceiveDetails",
    async ({ orderId }: { orderId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/aratdar-received-details/${orderId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const aratdarChangeStatus = createAsyncThunk(
    "order/aratdarChangeStatus",
    async (data: {
        orderId: string,
        status: "PROCESSING" | "SHIPPED" | "DELIVERED"
    }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/aratdar-change-status/${data.orderId}`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getRetailerPlacedOrder = createAsyncThunk(
    "order/retailerPlaceOrder",
    async (params: { page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/retailer-placed`, {
                withCredentials: true,
                params
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getRetailerPlacedOrderDetails = createAsyncThunk(
    "order/retailerPlacedDetails",
    async ({ orderId }: { orderId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/retailer-placed-details/${orderId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const cancelRetailerOrder = createAsyncThunk(
    "order/cancel",
    async (data: cancelOrderType, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/cancel`, data,
                {
                    withCredentials: true
                }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType {
    orderLoading: boolean
    farmerReceiveOrders: FarmerReceiveOrderResponse
    farmerReceivesOrderDetails: FarmerReceiveOrderDetailsResponse | null
    aratdarPlaceOrders: AratdarPlacedOrderResponse
    aratdarPlaceOrderDetails: AratdarPlacedOrderDetailsResponse | null
    aratdarReceiveOrders: AratdarReceivedOrderResponse
    aratdarReceiveOrderDetails: AratdarReceiveOrderDetailsResponse | null
    retailerPlaceOrders: RetailerPlacedOrderResponse
    retailerPlaceOrderDetials: RetailerPlacedOrderDetailsResponse | null
}

const initialState: initialStateType = {
    orderLoading: false,
    farmerReceiveOrders: {
        orders: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalOrders: 0,
            totalPages: 0
        }
    },
    farmerReceivesOrderDetails: null,
    aratdarPlaceOrders: {
        orders: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalOrders: 0,
            totalPages: 0
        }
    },
    aratdarPlaceOrderDetails: null,
    aratdarReceiveOrderDetails: null,
    aratdarReceiveOrders: {
        orders: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalOrders: 0,
            totalPages: 0
        }
    },
    retailerPlaceOrderDetials: null,
    retailerPlaceOrders: {
        orders: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalOrders: 0,
            totalPages: 0
        }
    }
}

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getFarmerReceiveOrders.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(getFarmerReceiveOrders.fulfilled, (state, action) => {
                state.orderLoading = false
                state.farmerReceiveOrders = action.payload.data
            })
            .addCase(getFarmerReceiveOrders.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(getFarmerReceiveOrderDetails.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(getFarmerReceiveOrderDetails.fulfilled, (state, action) => {
                state.orderLoading = false
                state.farmerReceivesOrderDetails = action.payload.data
            })
            .addCase(getFarmerReceiveOrderDetails.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(changeFarmerOrderStatus.fulfilled, (state, action) => {
                const orderId = action.payload.data.orderId
                const status = action.payload.data.status
                if (state.farmerReceivesOrderDetails) {
                    state.farmerReceivesOrderDetails.status = status
                }
                if (state.farmerReceiveOrders.orders.length > 0) {
                    const idx = state.farmerReceiveOrders.orders.findIndex((order) => order._id === orderId)
                    if (idx > -1) {
                        state.farmerReceiveOrders.orders[idx].status = status
                    }
                }
            })
        builder
            .addCase(getAratdarPlacedOrders.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(getAratdarPlacedOrders.fulfilled, (state, action) => {
                state.orderLoading = false
                state.aratdarPlaceOrders = action.payload.data
            })
            .addCase(getAratdarPlacedOrders.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(getAratdarPlacedOrderDetails.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(getAratdarPlacedOrderDetails.fulfilled, (state, action) => {
                state.orderLoading = false
                state.aratdarPlaceOrderDetails = action.payload.data
            })
            .addCase(getAratdarPlacedOrderDetails.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(createOrder.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.orderLoading = false
                state.aratdarPlaceOrderDetails = action.payload.data
                if (state.aratdarPlaceOrders.orders.length > 0) {
                    state.aratdarPlaceOrders.orders = [action.payload.data, ...state.aratdarPlaceOrders.orders]
                }
            })
            .addCase(createOrder.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(getAratdarReceiveOrder.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(getAratdarReceiveOrder.fulfilled, (state, action) => {
                state.orderLoading = false
                state.aratdarReceiveOrders = action.payload.data
            })
            .addCase(getAratdarReceiveOrder.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(getAratdarReceiveOrderDetails.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(getAratdarReceiveOrderDetails.fulfilled, (state, action) => {
                state.orderLoading = false
                state.aratdarReceiveOrderDetails = action.payload.data
            })
            .addCase(getAratdarReceiveOrderDetails.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(aratdarChangeStatus.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(aratdarChangeStatus.fulfilled, (state, action) => {
                state.orderLoading = false
                const orderId = action.payload.data.orderId
                const status = action.payload.data.status
                if (state.aratdarReceiveOrderDetails) {
                    state.aratdarReceiveOrderDetails.status = status
                }
                if (state.aratdarReceiveOrders.orders.length > 0) {
                    const idx = state.aratdarReceiveOrders.orders.findIndex((order) => order._id === orderId)
                    if (idx > -1) {
                        state.aratdarReceiveOrders.orders[idx].status = status
                    }
                }
            })
            .addCase(aratdarChangeStatus.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(getRetailerPlacedOrder.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(getRetailerPlacedOrder.fulfilled, (state, action) => {
                state.orderLoading = false
                state.retailerPlaceOrders = action.payload.data
            })
            .addCase(getRetailerPlacedOrder.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(getRetailerPlacedOrderDetails.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(getRetailerPlacedOrderDetails.fulfilled, (state, action) => {
                state.orderLoading = false
                state.retailerPlaceOrderDetials = action.payload.data
            })
            .addCase(getRetailerPlacedOrderDetails.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(createInventoryOrder.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(createInventoryOrder.fulfilled, (state, action) => {
                state.orderLoading = false
                const data: CreateInventoryOrderResponse = action.payload.data
                state.retailerPlaceOrderDetials = data
            })
            .addCase(createInventoryOrder.rejected, (state) => {
                state.orderLoading = false
            })
        builder
            .addCase(cancelRetailerOrder.fulfilled, (state, action) => {
                const orderId = action.payload.data
                const cancelReason = action.payload.cancelReason
                state.retailerPlaceOrders.orders = state.retailerPlaceOrders.orders.filter((order) => order._id !== orderId)
                if (state.retailerPlaceOrderDetials &&
                    state.retailerPlaceOrderDetials?._id === orderId) {
                    state.retailerPlaceOrderDetials.cancelReason = cancelReason
                    state.retailerPlaceOrderDetials.status = "CANCELLED"
                }
            })
    },
})

export default orderSlice.reducer