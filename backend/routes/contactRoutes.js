const express =
require("express")

const router =
express.Router()

const {

  submitContact,
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

const adminAccess = [

  protect,

  authorizeRoles(
    "superadmin",
    "admin",
    "staff"
  )

]

/* SUBMIT (PUBLIC) */

router.post(
  "/",
  submitContact
)

/* GET ALL (ADMIN) */

router.get(
  "/",
  ...adminAccess,
  getAllMessages
)

/* MARK READ */

router.put(
  "/:id/read",
  ...adminAccess,
  markAsRead
)

/* DELETE */

router.delete(
  "/:id",
  ...adminAccess,
  deleteMessage
)

module.exports =
router
