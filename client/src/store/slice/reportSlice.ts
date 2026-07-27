import { createReportType, ViewAllReportsResponse, ViewReportByIdResponse } from "@/types/reportTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/report`

export const createReport = createAsyncThunk(
    "report/create",
    async (data: createReportType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/create`, data, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllReport = createAsyncThunk(
    "report/getAll",
    async (params: { page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-reports`, {
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

export const getReport = createAsyncThunk(
    "report/get",
    async ({ reportId }: { reportId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/report/${reportId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const sendReportWarning = createAsyncThunk(
    "report/warning",
    async (data: { reportId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/warning`, data, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const setReportViewDone = createAsyncThunk(
    "report/viewDone",
    async (data: { reportId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/view-done`, data, {
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
    reportLoading: boolean
    allReports: ViewAllReportsResponse
    report: ViewReportByIdResponse | null
}

const initialState: initialStateType = {
    reportLoading: false,
    allReports: {
        pagination: {
            page: 0,
            limit: 20,
            hasNextPage: false,
            hasPrevPage: false,
            totalPages: 0,
            totalReports: 0
        },
        reports: []
    },
    report: null
}

const reportSlice = createSlice({
    name: "report",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //create report
        builder
            .addCase(createReport.pending, (state) => {
                state.reportLoading = true
            })
            .addCase(createReport.fulfilled, (state, action) => {
                state.reportLoading = false
            })
            .addCase(createReport.rejected, (state) => {
                state.reportLoading = false
            })
        //get all report
        builder
            .addCase(getAllReport.pending, (state) => {
                state.reportLoading = true
            })
            .addCase(getAllReport.fulfilled, (state, action) => {
                state.reportLoading = false
                state.allReports = action.payload.data
            })
            .addCase(getAllReport.rejected, (state) => {
                state.reportLoading = false
            })
        //get report
        builder
            .addCase(getReport.pending, (state) => {
                state.reportLoading = true
            })
            .addCase(getReport.fulfilled, (state, action) => {
                state.reportLoading = false
                state.report = action.payload.data
            })
            .addCase(getReport.rejected, (state) => {
                state.reportLoading = false
            })
        //send report warning
        builder
            .addCase(sendReportWarning.fulfilled, (state, action) => {
                const reportId = action.payload.data
                state.allReports.reports = state.allReports.reports.filter((report) => report._id !== reportId)
            })
        //set report view done
        builder
            .addCase(setReportViewDone.fulfilled, (state, action) => {
                const reportId = action.payload.data
                state.allReports.reports = state.allReports.reports.filter((report) => report._id !== reportId)
            })
    },
})

export default reportSlice.reducer