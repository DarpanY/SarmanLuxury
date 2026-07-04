const express =
require("express")

const router =
express.Router()

const {

  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getAbandonedCarts,
  getAnalytics

} = require(

  "../controllers/adminController"

)

const {

  getAllMessages,
  markAsRead,
  deleteMessage

} = require(

  "../controllers/contactController"

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

/* ROLE GROUPS */

const allStaff = [

  protect,

  authorizeRoles(
    "superadmin",
    "admin",
    "staff"
  )

]

const adminAndAbove = [

  protect,

  authorizeRoles(
    "superadmin",
    "admin"
  )

]

const superAdminOnly = [

  protect,

  authorizeRoles(
    "superadmin"
  )

]

/* DASHBOARD */

router.get(
  "/dashboard",
  ...allStaff,
  getDashboardStats
)

/* USERS — all staff can view, only admin+ can modify */

router.get(
  "/users",
  ...allStaff,
  getAllUsers
)

router.put(
  "/users/:id/role",
  ...adminAndAbove,
  updateUserRole
)

router.delete(
  "/users/:id",
  ...adminAndAbove,
  deleteUser
)

/* ORDERS — all staff can view, all staff can update status */

router.get(
  "/orders",
  ...allStaff,
  getAllOrders
)

router.put(
  "/orders/:id/status",
  ...allStaff,
  updateOrderStatus
)

/* ABANDONED CARTS */

router.get(
  "/abandoned-carts",
  ...allStaff,
  getAbandonedCarts
)

/* CONTACT MESSAGES */

router.get(
  "/messages",
  ...allStaff,
  getAllMessages
)

router.put(
  "/messages/:id/read",
  ...allStaff,
  markAsRead
)

router.delete(
  "/messages/:id",
  ...adminAndAbove,
  deleteMessage
)

/* ANALYTICS — superadmin only */

router.get(

  "/analytics",

  protect,

  authorizeRoles("superadmin"),

  getAnalytics

)

module.exports =
router
