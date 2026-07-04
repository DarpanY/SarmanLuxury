const express =
require("express")

const router =
express.Router()

const {

  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getRelatedProducts

} = require(

  "../controllers/productController"

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

/* PUBLIC */

router.get("/", getProducts)

router.get("/related/:id", getRelatedProducts)

router.get("/:id", getProductById)

/* CREATE — superadmin only */

router.post(

  "/",

  protect,

  authorizeRoles("superadmin"),

  createProduct

)

/* UPDATE — superadmin + admin */

router.put(

  "/:id",

  protect,

  authorizeRoles(
    "superadmin",
    "admin"
  ),

  updateProduct

)

/* DELETE — superadmin only */

router.delete(

  "/:id",

  protect,

  authorizeRoles("superadmin"),

  deleteProduct

)

/* REVIEWS — any logged in user */

router.post(
  "/:id/reviews",
  protect,
  createReview
)

module.exports =
router
