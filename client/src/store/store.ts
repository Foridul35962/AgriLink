import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/store/slice/authSlice"
import productSlice from "@/store/slice/productSlice"
import adminSlice from "@/store/slice/adminSlice"
import reportSlice from "@/store/slice/reportSlice"

const store = configureStore({
    reducer: {
        auth: authSlice,
        product: productSlice,
        admin: adminSlice,
        report: reportSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store