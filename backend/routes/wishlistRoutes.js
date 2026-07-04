const express =
require("express")

const router =
express.Router()

const {

  getWishlist,
  addToWishlist,
  removeWishlist

} = require(

  "../controllers/wishlistController"

)

const {

  protect

} = require(

  "../middleware/authMiddleware"

)

/* GET */

router.get(

  "/",

  protect,

  getWishlist

)

/* ADD */

router.post(

  "/",

  protect,

  addToWishlist

)

/* REMOVE */

router.delete(

  "/:productId",

  protect,

  removeWishlist

)

module.exports =
router