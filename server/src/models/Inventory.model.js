import mongoose from "mongoose";
import { CropCategory } from "../constants/product.types.js";

const investorySchema = new mongoose.Schema({
    aratdarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: CropCategory
    },
    totalQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    allocatedQuantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    pricePerUnit: {
        type: Number,
        required: true,
        default: 0
    },
    image: {
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    },
    description: {
        type: String,
        maxLength: 300
    },
    status: {
        type: String,
        required: true,
        enum: ["available", "depleted"],
        default: "available"
    }
})

const Inventories = mongoose.model("Inventory", investorySchema)
export default Inventories