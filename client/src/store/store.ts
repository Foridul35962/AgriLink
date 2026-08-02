import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/store/slice/authSlice"
import productSlice from "@/store/slice/productSlice"
import adminSlice from "@/store/slice/adminSlice"
import reportSlice from "@/store/slice/reportSlice"
import orderSlice from "@/store/slice/orderSlice"
import cropSlice from "@/store/slice/cropSlice"

const store = configureStore({
    reducer: {
        auth: authSlice,
        product: productSlice,
        admin: adminSlice,
        report: reportSlice,
        order: orderSlice,
        crop: cropSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store