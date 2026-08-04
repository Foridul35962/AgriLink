import { CreateCropRequest, CreateRecommendationTypes, CropDetails, CropRecommendation, GetAllCropData, UpdateRecommendationTypes } from "@/types/cropTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/crop`

export const createCrop = createAsyncThunk(
    "crop/create",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/create`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllCrops = createAsyncThunk(
    "crop/all",
    async (params: { name?: string, category?: string, page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all`, {
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

export const getCropDetails = createAsyncThunk(
    "crop/details",
    async ({ cropId }: { cropId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/details/${cropId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const updateCrop = createAsyncThunk(
    "crop/update",
    async ({ cropId, data }: { cropId: string, data: FormData }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/update/${cropId}`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteCrop = createAsyncThunk(
    "crop/delete",
    async ({ cropId }: { cropId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/delete/${cropId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const createRecommendation = createAsyncThunk(
    "crop/recommendation",
    async (data: CreateRecommendationTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/create-recommendation`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const updateRecommendation = createAsyncThunk(
    "crop/updaterecommendation",
    async (data: UpdateRecommendationTypes, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/update-recommendation`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteRecommendation = createAsyncThunk(
    "crop/deleterecommendation",
    async ({ cropRecommendationId }: { cropRecommendationId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/delete-recommendation/:${cropRecommendationId}`,
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
    cropLoading: boolean
    allCrops: GetAllCropData
    cropDetails: CropDetails
}

const initialState: initialStateType = {
    cropLoading: false,
    allCrops: {
        crops: [],
        pagination: {
            currentPage: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 0,
            totalCrops: 0,
            totalPages: 0
        }
    },
    cropDetails: {
        crop: null,
        recommendation: null
    }
}

const cropSlice = createSlice({
    name: "crop",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createCrop.pending, (state) => {
                state.cropLoading = true
            })
            .addCase(createCrop.fulfilled, (state, action) => {
                state.cropLoading = false
                state.cropDetails = action.payload.data
                if (state.allCrops.crops.length > 0) {
                    state.allCrops.crops = [...action.payload.data, state.allCrops.crops]
                } else {
                    state.allCrops.crops = [action.payload.data]
                }
            })
            .addCase(createCrop.rejected, (state) => {
                state.cropLoading = false
            })
        builder
            .addCase(getAllCrops.pending, (state) => {
                state.cropLoading = true
            })
            .addCase(getAllCrops.fulfilled, (state, action) => {
                state.cropLoading = false
                state.allCrops = action.payload.data
            })
            .addCase(getAllCrops.rejected, (state) => {
                state.cropLoading = false
            })
        builder
            .addCase(getCropDetails.pending, (state) => {
                state.cropLoading = true
            })
            .addCase(getCropDetails.fulfilled, (state, action) => {
                state.cropLoading = false
                state.cropDetails = action.payload.data
            })
            .addCase(getCropDetails.rejected, (state) => {
                state.cropLoading = false
            })
        builder
            .addCase(updateCrop.pending, (state) => {
                state.cropLoading = true
            })
            .addCase(updateCrop.fulfilled, (state, action) => {
                state.cropLoading = false
                const crop: CreateCropRequest = action.payload.data
                state.cropDetails.crop = crop
                const idx = state.allCrops.crops.findIndex((c) => c._id === crop._id)
                if (idx > -1) {
                    state.allCrops.crops[idx] = crop
                }
            })
            .addCase(updateCrop.rejected, (state) => {
                state.cropLoading = false
            })
        builder
            .addCase(deleteCrop.pending, (state) => {
                state.cropLoading = true
            })
            .addCase(deleteCrop.fulfilled, (state, action) => {
                state.cropLoading = false
                const cropId = action.payload.data
                if (state.allCrops.crops) {
                    state.allCrops.crops = state.allCrops.crops.filter((crop) => crop._id !== cropId)
                }
                if (state.cropDetails.crop?._id === cropId) {
                    state.cropDetails.crop = null
                    state.cropDetails.recommendation = null
                }
            })
            .addCase(deleteCrop.rejected, (state) => {
                state.cropLoading = false
            })
        builder
            .addCase(createRecommendation.pending, (state) => {
                state.cropLoading = true
            })
            .addCase(createRecommendation.fulfilled, (state, action) => {
                state.cropLoading = false
                const recommendation: CropRecommendation = action.payload.data
                if (state.cropDetails.crop?._id === recommendation.cropId) {
                    state.cropDetails.recommendation = recommendation
                }
            })
            .addCase(createRecommendation.rejected, (state) => {
                state.cropLoading = false
            })
        builder
            .addCase(updateRecommendation.fulfilled, (state, action) => {
                const recommendation: CropRecommendation = action.payload.data
                if (state.cropDetails.crop?._id === recommendation.cropId) {
                    state.cropDetails.recommendation = recommendation
                }
            })
        builder
            .addCase(deleteRecommendation.fulfilled, (state, action) => {
                state.cropLoading = false
                const { cropId, cropRecommendationId } = action.payload.data
                if (state.cropDetails.crop?._id === cropId &&
                    state.cropDetails.recommendation?._id === cropRecommendationId) {
                    state.cropDetails.recommendation = null
                }
            })
    },
})

export default cropSlice.reducer