const express =
require("express")

const router =
express.Router()

const {

  applyCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon

} = require(
  "../controllers/couponController"
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

/* USER — apply coupon */

router.post(
  "/apply",
  protect,
  applyCoupon
)

/* ADMIN — manage coupons */

router.get(
  "/",
  protect,
  authorizeRoles("superadmin", "admin"),
  getAllCoupons
)

router.post(
  "/",
  protect,
  authorizeRoles("superadmin"),
  createCoupon
)

router.put(
  "/:id",
  protect,
  authorizeRoles("superadmin"),
  updateCoupon
)

router.delete(
  "/:id",
  protect,
  authorizeRoles("superadmin"),
  deleteCoupon
)

module.exports = router
