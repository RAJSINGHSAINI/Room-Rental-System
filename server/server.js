// external modules
import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import "dotenv/config"
import cookieParser from "cookie-parser"
import connectDB from "./config/mongodb.js"
import { authRouter } from "./routes/authRouter.js"
import userRouter from "./routes/userRouter.js"
import { homeRouter } from "./routes/homeRouter.js"
import bookingRouter from "./routes/bookingRouter.js"

// __dirname does not exist in ES modules (import/export syntax) — this recreates it
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// app
const app = express()

// port (Render sets process.env.PORT automatically — do not hardcode it)
const port = process.env.PORT || 8080

// database
connectDB()
app.use(express.json())
app.use(cookieParser())

// CORS only matters for local dev, where the client might be opened on a
// different port (e.g. Live Server on 5501) than the API (8080).
// In production, client + API are served from the same origin, so this
// is effectively unused there — but harmless to keep.
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://192.168.0.112:5501",
    credentials: true
}));

// uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// serve the client folder — mounted at /client so it matches every
// "/client/HTML/..." absolute path already hardcoded in your client JS
app.use("/client", express.static(path.join(__dirname, "../client")));

// root -> send visitors straight to the site's home page
app.get("/", (req, res) => {
    res.redirect("/client/HTML/index.html");
});

// api
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/home', homeRouter)
app.use('/api/booking', bookingRouter)

app.listen(port, "0.0.0.0", () => { console.log(`server running in port ${port}`) })
