import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    verifyOtp: {
        type: String,
        default: ''
    },
    otpType: {
        type: String,
        default: ''
    },
    tempEmail: {
        type: String,
        default: ''
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0
    },

    isAccountVerified: {
        type: Boolean,
        default: false
    },

    resetOtp: {
        type: String,
        default: ''
    },

    resetOtpExpireAt: {
        type: Number,
        default: 0
    },
    address: {
        street: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        pincode: {
            type: String
        }
    },

    // Homes listed by the user (owner)
    listedHomes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Home"
        }
    ],

    // Homes booked by the user
    bookedHomes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book"
        }
    ],

    // Favorite homes
    favoriteHomes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Home"
        }
    ]

}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model("User", userSchema);

export default userModel;