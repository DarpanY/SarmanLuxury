const express =
require("express")

const router =
express.Router()

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

/* USER ROUTE */

router.get(

  "/profile",

  protect,

  (req, res) => {

    res.json({

      message:
      "Protected Profile",

      user:req.user

    })

  }

)

/* ADMIN ROUTE */

router.get(

  "/admin",

  protect,

  authorizeRoles(
    "superadmin",
    "admin"
  ),

  (req, res) => {

    res.json({

      message:
      "Admin Access Granted"

    })

  }

)

module.exports =
router