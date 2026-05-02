import bookModel from "../models/book.js";
import homeModel from "../models/home.js";
import userModel from "../models/user.js";

export const bookHome = async (req, res) => {

    try {

        const { homeID } = req.body;
        const { userID } = req;
        const { name, checkInDate, checkOutDate, guests, email, phone, request } = req.body;

        const home = await homeModel.findById(homeID);
        const user = await userModel.findById(userID);
        if (!home) {
            return res.json({ success: false, message: 'home not found' });
        }
        if (!user) {
            return res.json({ success: false, message: 'user not found' });
        }
        if (!user.isAccountVerified) {
            return res.json({ success: false, message: 'user not verified' });

        }
        if (!name || !checkInDate || !checkOutDate || !guests || !email || !phone) {
            return res.json({ success: false, message: 'please fill this fields' });
        }

        //  Convert Dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        //  Date Validation
        if (checkIn < today) {
            return res.status(400).json({ success: false, message: "Check-in cannot be in past" });
        }

        if (checkOut <= checkIn) {
            return res.status(400).json({ success: false, message: "Check-out must be after check-in" });
        }

        if (guests > home.maxGuests) {
            return res.status(400).json({ success: false, message: `Only ${home.maxGuests} guests allowed` });
        }

        // main existing booking

        const existingBooking = await bookModel.findOne({
            home: homeID,
            status: { $in: ["confirmed", "checked-in"] },
            $or: [
                {
                    checkInDate: { $lt: checkOut },
                    checkOutDate: { $gt: checkIn }
                }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ success: false, message: "Room already booked for selected dates" });
        }

        const totalDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalPrice = totalDays * home.pricePerNight;

        // booking

        const booking = await bookModel.create({
            user: user._id,
            home: homeID,
            owner: home.owner,
            name,
            email,
            phone,
            guests,
            specialRequest: request,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalDays,
            pricePerNight: home.pricePerNight,
            totalPrice,
            status: "confirmed"
        });

        user.bookedHomes.push(booking._id)
        await user.save()
        res.json({ success: true, message: 'Room Booked Successfully' });


    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }


}

export const getAllBookings = async (req, res) => {
    try {
        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (!user.isAccountVerified) {
            return res.json({ success: false, message: 'user not verified' });
        }

        const bookings = await bookModel.find({ user: userID }).populate("home");

        if (!bookings.length) {
            return res.json({ success: false, message: "No bookings found" });
        }

        return res.json({ success: true, bookings });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

export const cancelBooking = async (req, res) => {

    const { bookID, cancelledBy } = req.body;

    try {

        const booking = await bookModel.findById(bookID)
        if (!booking) {
            return res.json({ success: false, message: "booking not found" });
        }
        if (!cancelledBy) {
            return res.json({ success: false, message: "Invalid request" });
        }

        booking.cancelledBy = cancelledBy;
        booking.status = "cancelled";
        await booking.save();

        return res.json({ success: true, message: "Booking cancel successfully" });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }

}

export const getOwnerBooking = async (req, res) => {
    try {

        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.isAccountVerified) {
            return res.json({ success: false, message: 'user not verified' });
        }
        // Find all homes of this owner
        const homes = await homeModel.find({ owner: userID }).select("_id");

        if (!homes.length) {
            return res.json({ success: false, message: "No homes found" });
        }
        // home id
        const id = req.params.id;


        // Find bookings of those homes
        const bookings = await bookModel.find({ home: { $in: id } })

        if (!bookings.length) {
            return res.json({ success: false, message: "No bookings found" });
        }
        const formattedBookings = bookings.map(b => ({
            _id: b._id,
            name: b.name,
            email: b.email,
            phone: b.phone,
            specialRequest: b.specialRequest,
            checkInDate: b.checkInDate,
            checkOutDate: b.checkOutDate,
            totalDays: b.totalDays,
            totalPrice: b.totalPrice,
            status: b.status,
            cancelledBy: b.cancelledBy
        }));

        res.json({ success: true, bookings: formattedBookings });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};



export const getOwnerHomesWithBookings = async (req, res) => {
    try {

        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.isAccountVerified) {
            return res.json({ success: false, message: 'user not verified' });
        }

        const homes = await homeModel.find({ owner: userID });

        if (!homes.length) {
            return res.json({ success: false, message: "No homes found" });
        }

        const homeIds = homes.map(home => home._id);

        const bookings = await bookModel.find({
            home: { $in: homeIds }
        }).populate("home");

        if (!bookings.length) {
            return res.json({ success: true, homes: [] });
        }

        const result = Object.values(
            bookings.reduce((acc, booking) => {

                const homeId = booking.home._id.toString();

                if (!acc[homeId]) {
                    acc[homeId] = {
                        _id: homeId,
                        title: booking.home.title,
                        coverImage: booking.home.coverImage,

                        totalBookings: 0,
                        activeBookings: 0,
                        completedBookings: 0,
                        cancelledBookings: 0,
                        totalDays: 0,
                        totalPrice: 0
                    };
                }

                acc[homeId].totalBookings += 1;

                if (["confirmed", "checked-in"].includes(booking.status)) {
                    acc[homeId].activeBookings += 1;
                    acc[homeId].totalDays += booking.totalDays;
                    acc[homeId].totalPrice += booking.totalPrice;
                }

                if (booking.status === "completed") {
                    acc[homeId].completedBookings += 1;
                }

                if (["cancelled"].includes(booking.status)) {
                    acc[homeId].cancelledBookings += 1;
                }


                return acc;

            }, {})
        );

        return res.json({
            success: true,
            homes: result
        });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

export const updateBookingData = async (req, res) => {

    try {

        const { userID } = req;

        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.isAccountVerified) {
            return res.json({ success: false, message: 'user not verified' });
        }

        const bookID = req.params.bookID;

        const { status } = req.body;

        if (!status) {
            return res.json({ success: false, message: "Invalid status" });
        }

        const book = await bookModel.findById(bookID);

        if (!book) {
            return res.json({ success: false, message: "booking not found" });
        }

        book.status = status;

        if (status === "cancelled") {
            book.cancelledBy = "owner";
        } else {
            book.cancelledBy = null;
        }

        await book.save();
        return res.json({ success: true, message: "Booking update successfully" });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }

}