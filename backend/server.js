const express = require("express")
const authRoutes = require("./routes/authRoutes")
const mongoose = require("mongoose")
const testRoutes = require("./routes/testRoutes")
const cors = require("cors")
const productRoutes = require("./routes/productRoutes")
require("dotenv").config()
const cartRoutes = require("./routes/cartRoutes")
const orderRoutes = require("./routes/orderRoutes")
const wishlistRoutes = require("./routes/wishlistRoutes")
const adminRoutes = require("./routes/adminRoutes")
const uploadRoutes = require("./routes/uploadRoutes")
const contactRoutes = require("./routes/contactRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const couponRoutes = require("./routes/couponRoutes")
const testimonialRoutes = require("./routes/testimonialRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const path = require("path")

const app = express()

/* MIDDLEWARE */
app.use(cors())
app.use(express.json())

/* UPLOADED FILES (product images/videos saved to disk) */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
)

/* API ROUTES */
app.use("/api/auth", authRoutes)
app.use("/api/test", testRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/testimonials", testimonialRoutes)
app.use("/api/categories", categoryRoutes)

/* HEALTH CHECK (handy for confirming the server + DB are alive after a deploy) */
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  res.status(200).json({
    server: "ok",
    db: dbState === 1 ? "connected" : "not connected"
  })
})

/* SERVE THE BUILT REACT FRONTEND (from backend/public, i.e. the Vite "dist" output) */
const publicDir = path.join(__dirname, "public")
app.use(express.static(publicDir))

/* CATCH-ALL: any non-API, non-uploads route falls back to index.html
   so React Router can handle client-side routing (e.g. /products, /login) */
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next()
  }
  res.sendFile(path.join(publicDir, "index.html"))
})

/* GLOBAL ERROR HANDLER (catches multer upload errors, etc.) */
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong"
    })
  }
  next()
})

/* DATABASE */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected")
    app.listen(process.env.PORT, () => {
      console.log(`Server Running On Port ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.log(err)
  })
