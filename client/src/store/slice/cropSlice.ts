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
    async(params:{name?:string, category?:string, page:number }, {rejectWithValue})=>{
        try {
            const res = await axios.get(`${SERVER_URL}/all`,{
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
    async({cropId}:{cropId:string},{rejectWithValue})=>{
        try {
            const res = await axios.get(`${SERVER_URL}/details/${cropId}`,
                {withCredentials: true}
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
    async({cropId, data}:{cropId:string, data:FormData},{rejectWithValue})=>{
        try {
            const res = await axios.patch(`${SERVER_URL}/update/${cropId}`, data,
                {withCredentials: true}
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
    async({cropId}:{cropId:string},{rejectWithValue})=>{
        try {
            const res = await axios.delete(`${SERVER_URL}/delete/${cropId}`,{
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
    async(data:CreateRecommendationTypes, {rejectWithValue})=>{
        try {
            const res = await axios.post(`${SERVER_URL}/create/recommendation`, data,
                {withCredentials:true}
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
    async(data:UpdateRecommendationTypes, {rejectWithValue})=>{
        try {
            const res = await axios.patch(`${SERVER_URL}/update/recommendation`, data,
                {withCredentials:true}
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
    async({cropRecommendationId}:{cropRecommendationId:string}, {rejectWithValue})=>{
        try {
            const res = await axios.delete(`${SERVER_URL}/delete/recommendation/:${cropRecommendationId}`,
                {withCredentials:true}
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType{
    cropLoading:boolean
}

const initialState:initialStateType={
    cropLoading:false
}

const cropSlice = createSlice({
    name:"crop",
    initialState,
    reducers:{},
    extraReducers:(builder)=> {
        
    },
})

export default cropSlice.reducer