// external modules
import express from "express"
import cors from "cors"
import "dotenv/config"
import cookieParser from "cookie-parser"
import connectDB from "./config/mongodb.js"
import { authRouter } from "./routes/authRouter.js"
import userRouter from "./routes/userRouter.js"
import { homeRouter } from "./routes/homeRouter.js"
import bookingRouter from "./routes/bookingRouter.js"

// app
const app = express()

// port
const port = process.env.PORT || 8080

// database
connectDB()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://192.168.0.120:5501",
    credentials: true
}));

// images

app.use("/uploads", express.static("uploads"));

// middleware
app.get('/', (req, res, next) => {
    res.send("server is running")
})

//api

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/home', homeRouter)
app.use('/api/booking', bookingRouter)

app.listen(port, "0.0.0.0", () => { console.log(`server running in port ${port}`) })