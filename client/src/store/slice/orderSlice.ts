import { AratdarPlacedOrderDetailsResponse, AratdarPlacedOrderResponse, changeFarmerOrderStatusType, FarmerReceiveOrderDetailsResponse, FarmerReceiveOrderResponse } from "@/types/orderTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { createOrder } from "./productSlice";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/order`

export const getFarmerReceiveOrders = createAsyncThunk(
    "order/farmerReceive",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/farmer-receive`, {
                withCredentials: true
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
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/aratdar-placed`, {
                withCredentials: true
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

interface initialStateType {
    orderLoading: boolean
    farmerReceiveOrders: FarmerReceiveOrderResponse
    farmerReceivesOrderDetails: FarmerReceiveOrderDetailsResponse | null
    aratdarPlaceOrders: AratdarPlacedOrderResponse
    aratdarPlaceOrderDetails: AratdarPlacedOrderDetailsResponse | null
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
    aratdarPlaceOrderDetails: null
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
            .addCase(changeFarmerOrderStatus.pending, (state) => {
                state.orderLoading = true
            })
            .addCase(changeFarmerOrderStatus.fulfilled, (state, action) => {
                state.orderLoading = false
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
            .addCase(changeFarmerOrderStatus.rejected, (state) => {
                state.orderLoading = false
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
    },
})

export default orderSlice.reducer