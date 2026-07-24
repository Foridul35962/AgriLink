import { acceptBidType, addBidType, AddProductResponse, Bid, GetAllMyProductsResponse, GetAllProductsResponse, GetProductResponse } from "@/types/productTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/product`

export const addProduct = createAsyncThunk(
    "product/add",
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

export const editProduct = createAsyncThunk(
    "product/edit",
    async ({ data, productId }: { data: FormData, productId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/edit/${productId}`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteProduct = createAsyncThunk(
    "product/delete",
    async ({ productId }: { productId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/delete/${productId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllMyProducts = createAsyncThunk(
    "product/getAllMy",
    async (data: { category?: string, status?: string, page: Number }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-my-product`,
                {
                    withCredentials: true,
                    params: data
                }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getProduct = createAsyncThunk(
    "product/get",
    async ({ productId }: { productId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/${productId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllProducts = createAsyncThunk(
    "product/getAll",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const addBid = createAsyncThunk(
    "product/addBid",
    async (data: addBidType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-bid`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const acceptBid = createAsyncThunk(
    "product/acceptBid",
    async (data: acceptBidType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/accept-bid`, data,
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
    productLoading: boolean
    myProducts: GetAllMyProductsResponse
    product: GetProductResponse | null
    allProducts: GetAllProductsResponse
}

const initialState: initialStateType = {
    productLoading: false,
    myProducts: {
        products: [],
        pagination: {
            currentPage: 1,
            limit: 0,
            totalPages: 0,
            totalProducts: 0
        }
    },
    product: null,
    allProducts: {
        products: [],
        pagination: {
            currentPage: 1,
            limit: 0,
            totalPages: 0,
            totalProducts: 0
        }
    }
}

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addProduct.pending, (state) => {
                state.productLoading = true
            })
            .addCase(addProduct.fulfilled, (state, action) => {
                state.productLoading = false
                if (state.myProducts.products.length === 0) {
                    state.myProducts.products = action.payload.data.product
                } else {
                    state.myProducts.products = [action.payload.data.product, ...state.myProducts.products]
                }
                state.product = action.payload.data
            })
            .addCase(addProduct.rejected, (state) => {
                state.productLoading = false
            })
        //edit product
        builder
            .addCase(editProduct.fulfilled, (state, action) => {
                if (state.product) {
                    state.product.product = action.payload.data
                }
                const productId = action.payload.data._id
                const index = state.myProducts.products.findIndex((product) => product._id === productId)
                if (index > -1) {
                    state.myProducts.products[index] = action.payload.data
                }
            })
        //delete product
        builder
            .addCase(deleteProduct.pending, (state) => {
                state.productLoading = true
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.productLoading = false
                const productId = action.payload.data
                if (state.myProducts.products) {
                    state.myProducts.products = state.myProducts.products.filter((product) => product._id !== productId)
                }
            })
            .addCase(deleteProduct.rejected, (state) => {
                state.productLoading = false
            })
        //get all my products
        builder
            .addCase(getAllMyProducts.pending, (state) => {
                state.productLoading = true
            })
            .addCase(getAllMyProducts.fulfilled, (state, action) => {
                state.productLoading = false
                state.myProducts = action.payload.data
            })
            .addCase(getAllMyProducts.rejected, (state) => {
                state.productLoading = false
            })
        //get product
        builder
            .addCase(getProduct.pending, (state) => {
                state.productLoading = true
            })
            .addCase(getProduct.fulfilled, (state, action) => {
                state.productLoading = false
                state.product = action.payload.data
            })
            .addCase(getProduct.rejected, (state) => {
                state.productLoading = false
            })
        //get all products
        builder
            .addCase(getAllProducts.pending, (state) => {
                state.productLoading = true
            })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.productLoading = false
                state.allProducts = action.payload.data
            })
            .addCase(getAllProducts.rejected, (state) => {
                state.productLoading = false
            })
        //add bidding
        builder
            .addCase(addBid.fulfilled, (state, action) => {
                if (!state.product) return;

                const { aratdarId, bidAmount, currentHighestBid } = action.payload.data;

                state.product.auction.currentHighestBid = currentHighestBid;

                const newBid: Bid = {
                    _id: "",
                    auctionId: state.product.auction._id,
                    aratdarId,
                    bidAmount,
                    status: "PLACED",
                    createdAt: "",
                    updatedAt: "",
                };

                if (state.product.topBids.length === 0) {
                    state.product.topBids.push(newBid);
                } else {
                    state.product.topBids[0] = newBid;
                }
            })
        //accept bid
        builder
            .addCase(acceptBid.fulfilled, (state, action) => {
                if (state.product) {
                    state.product.auction = action.payload.data.auction
                    state.product.winner = {
                        aratdar: action.payload.data.bid.aratdarId,
                        bidAmount: action.payload.data.bid.bidAmount,
                    };
                }
            })
    },
})

export default productSlice.reducer