import homeModel from "../models/home.js";
import userModel from "../models/user.js";

export const getUserData = async (req, res) => {
    try {

        const { userID } = req;

        const user = await userModel.findById(userID);

        if (!user) {
            return res.json({ success: false, message: "user not found" })
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
                email: user.email,
                address: user.address
            }
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const updateUserData = async (req, res) => {

    const { userID } = req;

    try {

        const user = await userModel.findById(userID);

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }

        const { name, address } = req.body;

        user.name = name || user.name
        user.address = address || user.address

        await user.save();

        return res.json({
            success: true,
            message: "Data saved successfully"
        })

    } catch (error) {

        return res.json({ success: false, message: error.message })

    }

}

export const wish = async (req, res) => {
    try {
        const { homeID, type } = req.body;
        const { userID } = req;

        if (type === 'add') {
            const result = await userModel.updateOne(
                {
                    _id: userID,
                    favoriteHomes: { $ne: homeID }
                },
                {
                    $addToSet: { favoriteHomes: homeID }
                }
            );

            if (result.modifiedCount === 0) {
                
                return res.json({ success: false, message: "Home already in wishlist" });
            }

            return res.json({ success: true, message: "Home added to wishlist" });
        }


        if (type === 'remove') {
            await userModel.findByIdAndUpdate(userID, {
                $pull: { favoriteHomes: homeID }
            });

            return res.json({ success: true, message: "Home removed from wishlist" });
        }

        return res.json({ success: false, message: "Invalid type" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};