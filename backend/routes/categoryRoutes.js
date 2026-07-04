const express = require("express")
const router  = express.Router()

const {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController")

const { protect }        = require("../middleware/authMiddleware")
const { authorizeRoles } = require("../middleware/roleMiddleware")

const superAdminOnly = [protect, authorizeRoles("superadmin")]

/* PUBLIC */
router.get("/",     getCategories)

/* SUPERADMIN */
router.get(   "/all",  ...superAdminOnly, getAllCategories)
router.post(  "/",     ...superAdminOnly, createCategory)
router.put(   "/:id",  ...superAdminOnly, updateCategory)
router.delete("/:id",  ...superAdminOnly, deleteCategory)

module.exports = router
