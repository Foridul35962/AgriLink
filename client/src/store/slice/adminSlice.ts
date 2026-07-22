import { GetUsersRequestResponse } from "@/types/adminTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin`
export const getRequestedMembers = createAsyncThunk(
    "admin/requestMember",
    async (params: { page?: number; role?: string } | undefined, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/user-request`, {
                params,
                withCredentials: true,
            });
            return res.data;
        } catch (error) {
            const err = error as AxiosError<any>;
            return rejectWithValue(err.response?.data || "Something went wrong");
        }
    }
);

export const acceptRequest = createAsyncThunk(
    "admin/accept",
    async (data: { userId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/user-request-accept`, data, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>;
            return rejectWithValue(err.response?.data || "Something went wrong");
        }
    }
)

export const rejectRequest = createAsyncThunk(
    "admin/reject",
    async (data: { userId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/user-request-reject`, data, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>;
            return rejectWithValue(err.response?.data || "Something went wrong");
        }
    }
)

export const deleteMember = createAsyncThunk(
    "admin/delete",
    async (data: {
        userId: string, reason: string, reportId: string
    }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/remove-member`, {
                withCredentials: true,
                data
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>;
            return rejectWithValue(err.response?.data || "Something went wrong");
        }
    }
)

interface initialStateType {
    adminLoading: boolean
    allUserReqMembers: GetUsersRequestResponse
}

const initialState: initialStateType = {
    adminLoading: false,
    allUserReqMembers: {
        users: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalPages: 0,
            totalUsers: 0
        }
    }
}

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getRequestedMembers.pending, (state) => {
                state.adminLoading = true
            })
            .addCase(getRequestedMembers.fulfilled, (state, action) => {
                state.adminLoading = false
                state.allUserReqMembers = action.payload.data
            })
            .addCase(getRequestedMembers.rejected, (state) => {
                state.adminLoading = false
            })
        //accept req
        builder
            .addCase(acceptRequest.fulfilled, (state, action) => {
                const userId = action.payload.data
                state.allUserReqMembers.users = state.allUserReqMembers.users.filter((user) => user._id !== userId)
            })
        //reject req
        builder
            .addCase(rejectRequest.fulfilled, (state, action) => {
                const userId = action.payload.data
                state.allUserReqMembers.users = state.allUserReqMembers.users.filter((user) => user._id !== userId)
            })
    },
})

export default adminSlice.reducer