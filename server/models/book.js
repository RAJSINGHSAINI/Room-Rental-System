import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    home: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Home",
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        trim: true
    },

    guests: {
        type: Number,
        required: true,
        min: 1
    },

    specialRequest: {
        type: String,
        trim: true
    },

    checkInDate: {
        type: Date,
        required: true
    },

    checkOutDate: {
        type: Date,
        required: true
    },

    totalDays: {
        type: Number,
        required: true
    },

    pricePerNight: {
        type: Number,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["confirmed", "checked-in", "completed", "cancelled"],
        default: "confirmed"
    },


    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    },

    cancelledBy: {
        type: String,
        enum: ["user", "owner",null],
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

export default mongoose.model("Booking", bookingSchema);