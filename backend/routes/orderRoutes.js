const express =
require("express")

const router =
express.Router()

const {

  placeOrder,
  getMyOrders,
  getAllOrders

} = require(

  "../controllers/orderController"

)

const {

  protect

} = require(

  "../middleware/authMiddleware"

)

const {

  authorizeRoles

} = require(

  "../middleware/roleMiddleware"

)

/* PLACE ORDER */

router.post(

  "/",

  protect,

  placeOrder

)

/* MY ORDERS */

router.get(

  "/my-orders",

  protect,

  getMyOrders

)

/* ADMIN ORDERS */

router.get(

  "/admin",

  protect,

  authorizeRoles(

    "superadmin",
    "admin",
    "staff"

  ),

  getAllOrders

)

module.exports =
router