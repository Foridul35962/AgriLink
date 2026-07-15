import { loginType, regitrationType, resendOtpTyp, userType, verifyInfoType } from "@/types/userTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth`

export const registration = createAsyncThunk(
    "auth/regi",
    async (data: regitrationType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/registration`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const verifyRegi = createAsyncThunk(
    "auth/verifyRegi",
    async (data: verifyInfoType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/verify-regi`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const login = createAsyncThunk(
    "login",
    async (data: loginType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/login`, data, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const logout = createAsyncThunk(
    "auth/logout",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/logout`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const forgetPass = createAsyncThunk(
    "auth/forgetPass",
    async (data: { email: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/forget-pass`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const verifyForgetPass = createAsyncThunk(
    "auth/verify-forgetPass",
    async (data: verifyInfoType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/verify-forget-pass`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const resetPass = createAsyncThunk(
    "auth/resetPass",
    async (data: loginType, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/reset-pass`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const resendOtp = createAsyncThunk(
    "auth/resendOtp",
    async (data: resendOtpTyp, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/resend-otp`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const fetchMe = createAsyncThunk(
    "auth/fetchMe",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/me`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType{
    authLoading:boolean
    isUserFetch: boolean
    user: userType | null
}

const initialState:initialStateType={
    authLoading: false,
    user: null,
    isUserFetch: false
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{},
    extraReducers:(builder)=> {
        //login
        builder
            .addCase(login.pending, (state)=>{
                state.authLoading = true
            })
            .addCase(login.fulfilled, (state, action)=>{
                state.authLoading = false
                state.user = action.payload.data
            })
            .addCase(login.rejected, (state)=>{
                state.authLoading = false
            })
        //logout
        builder
            .addCase(logout.pending, (state)=>{
                state.authLoading = true
            })
            .addCase(logout.fulfilled, (state)=>{
                state.authLoading = false
                state.user = null
            })
            .addCase(logout.rejected, (state)=>{
                state.authLoading = false
            })
        //fetch user
        builder
            .addCase(fetchMe.pending, (state)=>{
                state.authLoading = true
            })
            .addCase(fetchMe.fulfilled, (state, action)=>{
                state.authLoading = false
                state.isUserFetch = true
                state.user = action.payload.data
            })
            .addCase(fetchMe.rejected, (state)=>{
                state.authLoading = false
                state.isUserFetch = true
            })
    },
})

export default authSlice.reducer