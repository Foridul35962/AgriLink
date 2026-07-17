import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction",
        required: true
    },
    aratdarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bidAmount: {
        type: Number,
        required: true,
        min: 0.1
    },

    status: {
        type: String,
        enum: [
            "PLACED",
            "WINNER",
            "LOST",
            "CANCELLED"
        ],
        default: "PLACED"
    },
}, { timestamps: true });

bidSchema.index({ auctionId: 1, bidAmount: -1 });

const Bids = mongoose.model("Bid", bidSchema)
export default Bids