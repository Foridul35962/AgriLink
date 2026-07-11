import mongoose from "mongoose";

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
        enum: ["farmer", "aratdar", "retailer"],
        required: true,
    },
    district: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

userSchema.index(
    { email: 1 },
    { unique: true, sparse: true }
);

userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 259200 } // 3 days
)


const RequestUsers = mongoose.model("RequestUser", userSchema);

export default RequestUsers;