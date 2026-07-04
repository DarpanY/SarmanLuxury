const express =
require("express")

const router =
express.Router()

const {

  createRazorpayOrder,
  verifyPayment

} = require(

  "../controllers/paymentController"

)

const {

  protect

} = require(

  "../middleware/authMiddleware"

)

/* CREATE ORDER */

router.post(

  "/create-order",

  protect,

  createRazorpayOrder

)

/* VERIFY PAYMENT */

router.post(

  "/verify",

  protect,

  verifyPayment

)

module.exports = router
