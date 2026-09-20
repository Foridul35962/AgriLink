import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/store/slice/authSlice"
import productSlice from "@/store/slice/productSlice"
import adminSlice from "@/store/slice/adminSlice"
import reportSlice from "@/store/slice/reportSlice"
import orderSlice from "@/store/slice/orderSlice"
import cropSlice from "@/store/slice/cropSlice"
import inventorySlice from "@/store/slice/inventorySlice"
import dashboardSlice from "@/store/slice/dashboardSlice"
import notificationSlice from "@/store/slice/notificationSlice"

const store = configureStore({
    reducer: {
        auth: authSlice,
        product: productSlice,
        admin: adminSlice,
        report: reportSlice,
        order: orderSlice,
        crop: cropSlice,
        inventory: inventorySlice,
        dashboard: dashboardSlice,
        notification: notificationSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store