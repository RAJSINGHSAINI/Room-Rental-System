import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({

    // Owner of the home
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    pricePerNight: {
        type: Number,
        required: true
    },

    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },

    coverImage: {
        type: String   // image URLs
    },
    images: [
        {
            type: String   // image URLs
        }
    ],

    maxGuests: {
        type: Number,
        default: 1
    },

    bedrooms: {
        type: Number,
        default: 1
    },

    bathrooms: {
        type: Number,
        default: 1
    },

    isAvailable: {
        type: Boolean,
        default: true
    },
    ownerName: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    }
});

const homeModel = mongoose.models.Home || mongoose.model("Home", homeSchema);

export default homeModel;