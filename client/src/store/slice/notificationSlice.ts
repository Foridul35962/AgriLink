import { GetAllNotificationDataType, Notification, NotificationPagination } from "@/types/notificationTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/notification`

export const getAllNotification = createAsyncThunk(
    "notification/all",
    async (params: { page: number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all`,
                {
                    withCredentials: true,
                    params
                }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const readNotification = createAsyncThunk(
    "notification/read",
    async ({ notificationId }: { notificationId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/read/${notificationId}`, {},
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const readAllNotification = createAsyncThunk(
    "notification/readAll",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/read-all`, {},
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getUnReadNotificationCount = createAsyncThunk(
    "notification/un-read-count",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/unread-count`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteNotification = createAsyncThunk(
    "notification/delete",
    async ({ notificationId }: { notificationId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/delete/${notificationId}`,
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
    notificationLoading: boolean
    allNotificationData: GetAllNotificationDataType
    unreadNotificationCount: number
}

const initialState: initialStateType = {
    notificationLoading: false,
    allNotificationData: {
        pagination: {
            currentPage: 0,
            totalPages: 0,
            totalNotifications: 0,
            limit: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        },
        notifications: []
    },
    unreadNotificationCount: 0
}

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        deleteNotificationPrev: (state, action) => {
            const notificationId = action.payload;

            const target = state.allNotificationData.notifications.find(
                (notification) => notification._id === notificationId
            )
            if (!target) return

            if (!target.isReaded) {
                state.unreadNotificationCount = Math.max(0, state.unreadNotificationCount - 1)
            }

            state.allNotificationData.notifications =
                state.allNotificationData.notifications.filter(
                    (notification) => notification._id !== notificationId
                );

            state.allNotificationData.pagination.totalNotifications = Math.max(
                0,
                state.allNotificationData.pagination.totalNotifications - 1
            );
        },

        updateNotification: (state, action) => {
            const { notification } = action.payload
            if (!notification) return

            if (state.allNotificationData.notifications.some((n) => n._id === notification._id)) return

            state.allNotificationData.notifications = [notification, ...state.allNotificationData.notifications]
            state.allNotificationData.pagination.totalNotifications += 1
            state.unreadNotificationCount += 1
        }
    },
    extraReducers: (builder) => {
        //get all notification
        builder
            .addCase(getAllNotification.pending, (state) => {
                state.notificationLoading = true
            })
            .addCase(getAllNotification.fulfilled, (state, action) => {
                state.notificationLoading = false
                const {
                    pagination, notifications
                }: {
                    pagination: NotificationPagination,
                    notifications: Notification[]
                } = action.payload.data

                state.allNotificationData.pagination = pagination

                if (action.meta.arg.page <= 1) {
                    // FIX: page 1 replaces the list (menu + page both load page 1, so no duplicates)
                    state.allNotificationData.notifications = notifications
                } else {
                    // FIX: spread the array (before it was pushed as ONE nested array item)
                    // and skip anything that is already in the list
                    const existingIds = new Set(state.allNotificationData.notifications.map((n) => n._id))
                    state.allNotificationData.notifications.push(
                        ...notifications.filter((n) => !existingIds.has(n._id))
                    )
                }
            })
            .addCase(getAllNotification.rejected, (state) => {
                state.notificationLoading = false
            })

        //read notification
        builder
            .addCase(readNotification.fulfilled, (state, action) => {
                const notificationId = action.payload.data
                const target = state.allNotificationData.notifications.find(
                    (notification) => notification._id === notificationId
                )
                if (target && !target.isReaded) {
                    target.isReaded = true
                    state.unreadNotificationCount = Math.max(0, state.unreadNotificationCount - 1)
                }
            })

        //read all notification
        builder
            .addCase(readAllNotification.fulfilled, (state) => {
                state.allNotificationData.notifications.forEach((notification) => {
                    notification.isReaded = true
                })
                state.unreadNotificationCount = 0
            })

        //unread notification count
        builder
            .addCase(getUnReadNotificationCount.fulfilled, (state, action) => {
                state.unreadNotificationCount = action.payload.data
            })
    },
})

export const { deleteNotificationPrev, updateNotification } = notificationSlice.actions
export default notificationSlice.reducer