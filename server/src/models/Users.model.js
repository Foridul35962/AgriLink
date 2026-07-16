import mongoose from "mongoose";
import { DISTRICTS } from "../constants/common.types.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["farmer", "aratdar", "retailer", "admin"],
        required: true,
    },
    district: {
        type: String,
        required: true,
        enum: DISTRICTS,
        trim: true,
    },
}, { timestamps: true });


const Users = mongoose.model("User", userSchema);

export default Users;