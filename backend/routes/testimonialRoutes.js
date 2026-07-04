const express = require("express")
const router  = express.Router()

const {
  getTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} = require("../controllers/testimonialController")

const { protect }        = require("../middleware/authMiddleware")
const { authorizeRoles } = require("../middleware/roleMiddleware")

const superAdminOnly = [
  protect,
  authorizeRoles("superadmin")
]

/* PUBLIC */
router.get("/", getTestimonials)

/* SUPERADMIN */
router.get(   "/all",  ...superAdminOnly, getAllTestimonials)
router.post(  "/",     ...superAdminOnly, createTestimonial)
router.put(   "/:id",  ...superAdminOnly, updateTestimonial)
router.delete("/:id",  ...superAdminOnly, deleteTestimonial)

module.exports = router
