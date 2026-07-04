const express =
require("express")
const authRoutes =
require("./routes/authRoutes")
const mongoose =
require("mongoose")
const testRoutes =
require("./routes/testRoutes")
const cors =
require("cors")
const productRoutes =
require("./routes/productRoutes")
require("dotenv").config()
const cartRoutes =
require("./routes/cartRoutes")
const orderRoutes =
require("./routes/orderRoutes")
const wishlistRoutes =
require("./routes/wishlistRoutes")
const adminRoutes =
require("./routes/adminRoutes")
const uploadRoutes =
require("./routes/uploadRoutes")
const contactRoutes =
require("./routes/contactRoutes")

const paymentRoutes =
require("./routes/paymentRoutes")

const couponRoutes =
require("./routes/couponRoutes")

const testimonialRoutes =
require("./routes/testimonialRoutes")

const categoryRoutes =
require("./routes/categoryRoutes")
const path = require("path")

const app = express()

/* MIDDLEWARE */

app.use(cors())

app.use(express.json())
app.use(

  "/uploads",

  express.static(

    path.join(__dirname,"uploads")

  )

)
app.use(
  "/api/auth",
  authRoutes
)
app.use(
  "/api/test",
  testRoutes
)
app.use(
  "/api/products",
  productRoutes
)
app.use(
  "/api/cart",
  cartRoutes
)
app.use(
  "/api/orders",
  orderRoutes
)
app.use(
  "/api/wishlist",
  wishlistRoutes
)
app.use(
  "/api/admin",
  adminRoutes
)
app.use(
  "/api/upload",
  uploadRoutes
)
app.use(
  "/api/contact",
  contactRoutes
)

app.use(
  "/api/payment",
  paymentRoutes
)

app.use(
  "/api/coupons",
  couponRoutes
)

app.use(
  "/api/testimonials",
  testimonialRoutes
)

app.use(
  "/api/categories",
  categoryRoutes
)
/* TEST ROUTE */

app.get("/", (req, res) => {

  res.send(
    "Sarman Luxury API Running"
  )

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

mongoose.connect(
  process.env.MONGO_URI
)

.then(() => {

  console.log(
    "MongoDB Connected"
  )

  app.listen(

    process.env.PORT,

    () => {

      console.log(

        `Server Running On Port ${process.env.PORT}`

      )

    }

  )

})

.catch((err) => {

  console.log(err)

})