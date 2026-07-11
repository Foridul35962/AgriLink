import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["farmer", "aratdar", "retailer", "consumer", "admin"],
        required: true,
    },
    district: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });


userSchema.pre("validate", function () {
    if (!this.email && !this.phoneNumber) {
        this.invalidate(
            "email",
            "Either email or phone number is required"
        );
    }
});


// Indexes
userSchema.index(
    { userName: 1 },
    { unique: true }
);

userSchema.index(
    { email: 1 },
    { unique: true, sparse: true }
);

userSchema.index(
    { phoneNumber: 1 },
    { unique: true, sparse: true }
);


const Users = mongoose.model("User", userSchema);

export default Users;