const express =
require("express")

const router =
express.Router()

const {

  addToCart,
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart

} = require(

  "../controllers/cartController"

)

const {

  protect

} = require(

  "../middleware/authMiddleware"

)

/* GET CART */

router.get(

  "/",

  protect,

  getCart

)

/* ADD TO CART */

router.post(

  "/",

  protect,

  addToCart

)

/* REMOVE ITEM */

router.delete(

  "/:productId",

  protect,

  removeFromCart

)

/* UPDATE QUANTITY */

router.put(

  "/:productId",

  protect,

  updateQuantity

)

/* CLEAR CART */

router.delete(

  "/",

  protect,

  clearCart

)

module.exports =
router
