import mongoose from "mongoose";
import { CropCategory } from "../constants/product.types.js";
import { DISTRICTS } from "../constants/common.types.js";

const productSchema = new mongoose.Schema({
    farmerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    name:{
        type: String,
        required: true,
        trim: true
    },
    category:{
        type: String,
        required: true,
        enum: CropCategory
    },
    quantity:{
        type: Number,
        required: true,
        min: 0
    },
    unit:{
        type: String,
        required: true,
        enum: ["kg", "mon", "ton", "piece"],
        default: "kg"
    },
    pricePerUnit:{
        type:Number,
        required: true,
        min:0
    },
    district:{
        type: String,
        required: true,
        enum: DISTRICTS
    },
    harvestDate:{
        type: Date,
        required: true
    },
    image:{
        url:{
            type:String
        },
        publicId:{
            type:String
        }
    },
    description:{
        type:String,
        maxLength:300
    },
    status:{
        type:String,
        required: true,
        enum:["available", "sold", "expired"],
        default:"available"
    }
}, {timestamps: true})

productSchema.index({ district: 1, category: 1 });

const Products = mongoose.model("Products", productSchema)
export default Products