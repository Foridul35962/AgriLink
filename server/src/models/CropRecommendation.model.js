import mongoose from "mongoose";
import { DISTRICTS } from "../constants/common.types.js";

const cropRecommendationSchema = new mongoose.Schema({
    cropId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Crops",
        required: true,
        index: true
    },

    districts: [
        {
            type: String,
            index: true,
            enum: DISTRICTS
        },
    ],

    // Months when cultivation should start
    plantingMonths: [
        {
            type: Number,
            min: 1,
            max: 12,
        },
    ],

    // Optional season
    season: {
        type: String,
        enum: ["kharif-1", "kharif-2", "rabi", "all"],
        default: "all",
    },

    // Admin's explanation
    reason: {
        type: String,
    },

    tips: [
        {
            type: String,
        },
    ],
}, { timestamps: true })

const CropRecommendations = mongoose.model("CropRecommendations", cropRecommendationSchema)
export default CropRecommendations