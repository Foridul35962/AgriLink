import mongoose from "mongoose"
import { CropCategory } from "../constants/product.types.js"

const cropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },

    banglaName: {
        type: String,
        required: true,
        trim: true,
    },

    category: {
        type: String,
        required: true,
        enum: CropCategory
    },

    description: {
        type: String
    },

    image: {
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String
        }
    },

    weatherRequirement: {
        minTemperature: {
            type: Number,
        },

        maxTemperature: {
            type: Number,
        },

        minHumidity: {
            type: Number,
        },

        maxHumidity: {
            type: Number,
        },

        maxRainProbability: {
            type: Number,
        },

        maxRainfall: {
            type: Number,
        },
    },

    waterRequirement: {
        type: String,
        enum: ["low", "medium", "high"],
    },

    suitableSoil: [
        {
            type: String,
        },
    ],

    cultivationDuration: {
        type: Number, // days
    },

    cultivationTips: [
        {
            type: String,
        },
    ],
}, { timestamps: true })

const Crops = mongoose.model("Crops", cropSchema)
export default Crops