const express =
require("express")

const router =
express.Router()

const {

  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword

} = require(

  "../controllers/authController"

)

const {

  protect

} = require(

  "../middleware/authMiddleware"

)

/* REGISTER */

router.post(
  "/register",
  registerUser
)

/* LOGIN */

router.post(
  "/login",
  loginUser
)

/* GET PROFILE */

router.get(
  "/profile",
  protect,
  getProfile
)

/* UPDATE PROFILE */

router.put(
  "/profile",
  protect,
  updateProfile
)

/* CHANGE PASSWORD */

router.put(
  "/change-password",
  protect,
  changePassword
)

module.exports =
router
