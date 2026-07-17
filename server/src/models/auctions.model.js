import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true,
        unique: true
    },
    startPrice: {
        type: Number,
        required: true
    },

    currentHighestBid: {
        type: Number,
        default: 0
    },

    highestBidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },

    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },

    endTime: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: [
            "ACTIVE",
            "ENDED",
            "WAITING_FARMER_SELECTION",
            "WINNER_SELECTED",
            "ORDER_CREATED",
            "CANCELLED"
        ],
        default: "ACTIVE"
    },

    winnerBidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bid",
        default: null
    },

    selectedAt: {
        type: Date,
        default: null
    }

}, { timestamps: true });

const Auction = mongoose.model("Auction", auctionSchema)

export default Auction