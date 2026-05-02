import fs from "fs";
import path from "path";
import homeModel from "../models/home.js"
import userModel from "../models/user.js";

export const addHome = async (req, res) => {
    try {
        const { userID } = req;

        const { title, description, pricePerNight, contact, street, city, state, pincode, maxGuests, bedrooms, bathrooms } = req.body;

        if (!title || !description || !pricePerNight || !contact) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        if (!street || !city || !state || !pincode) {
            return res.json({ success: false, message: "Please fill all address fields" });
        }

        if (isNaN(pricePerNight)) {
            return res.json({ success: false, message: "Price must be a number" });
        }

        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.isAccountVerified) {
            return res.json({ success: false, message: "User not verified" });
        }

        //  Images
        const coverImage = req.files?.coverImage?.[0]?.filename || null;

        const images = req.files?.images
            ? req.files.images.map(file => file.filename)
            : [];

        const newHome = new homeModel({
            owner: userID,
            title,
            description,
            pricePerNight,
            coverImage,
            images,
            address: {
                street,
                city,
                state,
                pincode
            },
            maxGuests: maxGuests || 1,
            bedrooms: bedrooms || 1,
            bathrooms: bathrooms || 1,
            contact,
            ownerName: user.name
        });

        await newHome.save();

        await userModel.findByIdAndUpdate(userID, {
            $push: { listedHomes: newHome._id }
        });

        res.json({
            success: true,
            message: "Home added successfully",
            data: newHome
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
// all user listed homes
export const getHomes = async (req, res) => {

    try {
        const { userID } = req;
        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const homes = await homeModel.find({ owner: userID }).select("-owner");
        if (!homes) {
            return res.json({ success: false, message: "homes not found" });
        }

        return res.json({ success: true, homes });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }

}

export const getHome = async (req, res) => {

    try {
        const homeID = req.params.id;
        const home = await homeModel.findById(homeID);

        if (!home) {
            return res.json({ success: false, message: "homes not found" });
        }

        return res.json({ success: true, home });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }

}


export const saveHome = async (req, res) => {
    try {
        const { homeID } = req.body;

        const existingHome = await homeModel.findById(homeID);

        if (!existingHome) {
            return res.json({ success: false, message: "Home not found" });
        }

        const {
            title, description, name, contact,
            pricePerNight, maxGuests, bedrooms,
            bathrooms, available, street, city,
            state, pincode
        } = req.body;

        let coverImage = existingHome.coverImage;

        if (req.files?.coverImage) {
            if (existingHome.coverImage) {
                const oldPath = path.join(process.cwd(), "uploads", existingHome.coverImage);

                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            coverImage = req.files.coverImage[0].filename;
        }

        let images = existingHome.images;

        if (req.files?.images) {
            existingHome.images.forEach(img => {
                const imgPath = path.join(process.cwd(), "uploads", img);

                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            });

            images = req.files.images.map(file => file.filename);
        }

        const updatedHome = await homeModel.findByIdAndUpdate(
            homeID,
            {
                title, ownerName: name, description, contact, pricePerNight, maxGuests, bedrooms, bathrooms, isAvailable: available ? true : false, address: { street, city, state, pincode },
                coverImage, images
            },
            { new: true }
        );

        return res.json({
            success: true,
            message: "Home updated successfully",
            home: updatedHome
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};
export const delHome = async (req, res) => {
    try {
        const { userID } = req;
        const homeID = req.params.id;

        const home = await homeModel.findById(homeID);

        if (!home) {
            return res.json({ success: false, message: "Home not found" });
        }

        if (home.owner.toString() !== userID) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        const imagePath = path.join(process.cwd(), "uploads", home.coverImage);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        if (home.images && home.images.length > 0) {
            home.images.forEach(img => {
                const imgPath = path.join(process.cwd(), "uploads", img);

                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            });
        }

        await homeModel.findByIdAndDelete(homeID);

        await userModel.findByIdAndUpdate(userID, {
            $pull: { listedHomes: homeID }
        });

        res.json({ success: true, message: "Home deleted successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getAllHomes = async (req, res) => {
    try {
        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
       
        // const homes = await homeModel.find({ owner: { $ne: userID } });
        const homes = await homeModel.find({ isAvailable: true });
        if (!homes.length) {
            return res.json({ success: false, message: "No homes found" });
        }

        return res.json({ success: true, homes, verified: user.isAccountVerified });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export const checkListHome = async (req, res) => {
    try {
        const { userID } = req;
        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (!user.isAccountVerified) {
            return res.json({ success: false, message: 'user not verified' });
        }
        const { homeID } = req.params;

        const home = await homeModel.findById(homeID);

        if (!home) {
            return res.json({ success: false, message: "Home not found" });
        }

        if (home.owner.toString() === userID) {
            return res.json({ success: false, message: "You cannot book your own home" });
        }

        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

export const getWishHomes = async (req, res) => {

    try {

        const { userID } = req;

        const user = await userModel.findById(userID);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (!user.isAccountVerified) {
            return res.json({ success: false, message: 'user not verified' });
        }

        const homes = await homeModel.find({ _id: { $in: user.favoriteHomes } });

        if (!homes.length) {
            return res.json({ success: false, message: "Home not found" });
        }

        return res.json({ success: true, homes });


    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}