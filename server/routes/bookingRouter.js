import express from 'express'
import { userAuth } from '../middleware/userAuth.js';
import {bookHome, getAllBookings, cancelBooking, getOwnerBooking, getOwnerHomesWithBookings, updateBookingData} from '../controllers/bookController.js'
const bookingRouter = express.Router();

bookingRouter.post('/book',userAuth,bookHome)
bookingRouter.get('/get-all-bookings',userAuth,getAllBookings)
bookingRouter.put('/cancel-booking',userAuth,cancelBooking)
bookingRouter.get('/get-home-bookings/:id',userAuth,getOwnerBooking)
bookingRouter.get('/get-owner-home-bookings',userAuth,getOwnerHomesWithBookings)
bookingRouter.put('/update-status/:bookID',userAuth,updateBookingData)

export default bookingRouter