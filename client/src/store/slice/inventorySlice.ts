import { CropCategory } from "@/types/cropTypes";
import { AllInventoriesResponse, Inventory, MyInventoriesResponse } from "@/types/inventoryTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/inventory`

export const addInventory = createAsyncThunk(
    "inventory/add",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const editInventory = createAsyncThunk(
    "inventory/edit",
    async ({ data, inventoryId }: { data: FormData, inventoryId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/edit/${inventoryId}`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteInventory = createAsyncThunk(
    "inventory/delete",
    async ({ inventoryId }: { inventoryId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/delete/${inventoryId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getInventoryDetails = createAsyncThunk(
    "inventory/details",
    async ({ inventoryId }: { inventoryId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/details/${inventoryId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getMyInventory = createAsyncThunk(
    "inventory/my",
    async (params: { productName?: string, category?: string, page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/my`,
                {
                    withCredentials: true,
                    params
                },
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllInventory = createAsyncThunk(
    "inventory/all",
    async (params: { productName: string, category: CropCategory, page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all`,
                {
                    withCredentials: true,
                    params
                },
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType {
    inventoryLoading: boolean
    myInventories: MyInventoriesResponse
    allInventories: AllInventoriesResponse
    inventoryDetails: Inventory | null
}

const initialState: initialStateType = {
    inventoryLoading: false,
    myInventories: {
        inventories: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalInventories: 0,
            totalPages: 0
        }
    },
    allInventories: {
        inventory: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalInventories: 0,
            totalPages: 0
        }
    },
    inventoryDetails: null
}

const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addInventory.pending, (state) => {
                state.inventoryLoading = true
            })
            .addCase(addInventory.fulfilled, (state, action) => {
                state.inventoryLoading = false
                state.inventoryDetails = action.payload.data
                if (state.myInventories.inventories.length > 0) {
                    state.myInventories.inventories = [...action.payload.data, state.myInventories.inventories]
                } else {
                    state.myInventories.inventories = action.payload.data
                }
            })
            .addCase(addInventory.rejected, (state) => {
                state.inventoryLoading = false
            })
        builder
            .addCase(editInventory.pending, (state) => {
                state.inventoryLoading = true
            })
            .addCase(editInventory.fulfilled, (state, action) => {
                state.inventoryLoading = false
                state.inventoryDetails = action.payload.data
                const inventoryId = action.payload.data._id
                const idx = state.myInventories.inventories.findIndex((inventory) => inventory._id === inventoryId)
                if (idx > -1) {
                    state.myInventories.inventories[idx] = action.payload.data
                }
            })
            .addCase(editInventory.rejected, (state) => {
                state.inventoryLoading = false
            })
        builder
            .addCase(deleteInventory.fulfilled, (state, action) => {
                state.inventoryLoading = false
                const inventoryId = action.payload.data
                state.inventoryDetails = null
                state.myInventories.inventories = state.myInventories.inventories
                    .filter((inventory) => state.myInventories.inventories !== inventoryId)
            })
        builder
            .addCase(getMyInventory.pending, (state) => {
                state.inventoryLoading = true
            })
            .addCase(getMyInventory.fulfilled, (state, action) => {
                state.inventoryLoading = false
                state.myInventories = action.payload.data
            })
            .addCase(getMyInventory.rejected, (state) => {
                state.inventoryLoading = false
            })
        builder
            .addCase(getInventoryDetails.pending, (state) => {
                state.inventoryLoading = true
            })
            .addCase(getInventoryDetails.fulfilled, (state, action) => {
                state.inventoryLoading = false
                state.inventoryDetails = action.payload.data
            })
            .addCase(getInventoryDetails.rejected, (state) => {
                state.inventoryLoading = false
            })
        builder
            .addCase(getAllInventory.pending, (state) => {
                state.inventoryLoading = true
            })
            .addCase(getAllInventory.fulfilled, (state, action) => {
                state.inventoryLoading = false
                state.allInventories = action.payload.data
            })
            .addCase(getAllInventory.rejected, (state) => {
                state.inventoryLoading = false
            })
    },
})

export default inventorySlice.reducer