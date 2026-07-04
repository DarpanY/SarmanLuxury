const express =
require("express")

const router =
express.Router()

const {

  getAbandonedOrders,
  getAbandonedStats

} = require(

  "../controllers/abandonedController"

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

/* GET ABANDONED CARTS */

router.get(

  "/",

  protect,

  authorizeRoles(
    "superadmin",
    "admin",
    "staff"
  ),

  getAbandonedOrders

)

/* GET STATS */

router.get(

  "/stats",

  protect,

  authorizeRoles(
    "superadmin",
    "admin",
    "staff"
  ),

  getAbandonedStats

)

module.exports =
router