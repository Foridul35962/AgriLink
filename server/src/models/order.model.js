import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    sellerRole: {
        type: String,
        enum: ["farmer", "aratdar"],
        required: true,
    },

    buyerRole: {
        type: String,
        enum: ["aratdar", "retailer"],
        required: true,
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: function () {
            return this.sellerRole === 'farmer'
        },
    },

    inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
        required: function () {
            return this.sellerRole === "aratdar"
        }
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
    },

    pricePerUnit: {
        type: Number,
        required: true,
        min: 0,
    },

    unit: {
        type: String,
        enum: ["kg", "mon", "ton", "piece"],
        required: true
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },

    status: {
        type: String,
        enum: [
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ],
        default: "PENDING",
    },
});

const Orders = mongoose.model("Orders", orderSchema)
export default Orders