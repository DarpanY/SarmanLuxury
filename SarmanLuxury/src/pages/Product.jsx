import "./styles/Product.css"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { FiHeart } from "react-icons/fi"
import API from "../api/axios"
import Navbar from "../components/Navbar/Navbar"
import RelatedProducts from "../components/RelatedProducts/RelatedProducts"
import { useCart } from "../context/CartContext"
import { useWishlist } from "../context/WishlistContext"

const SHOE_SIZES = ["38","39","40","41","42","43","44","45"]

function Product() {

  const { id }       = useParams()
  const navigate     = useNavigate()
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeWishlist } = useWishlist()

  const [product,       setProduct]       = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [selectedImage, setSelectedImage] = useState("")
  const [selectedSize,  setSelectedSize]  = useState("")

  /* ── FETCH ── */

  useEffect(() => {

    const fetchProduct = async () => {

      try {

        const { data } = await API.get(`/products/${id}`)

        setProduct(data)
        setSelectedImage(data.images?.[0])

        /* Pre-select first size for shoes, empty for others */
        if (data.productCategory === "Shoes") {
          setSelectedSize("40")
        } else {
          setSelectedSize("Free Size")
        }

      } catch (err) {

        console.log(err)

      } finally {

        setLoading(false)

      }

    }

    fetchProduct()

  }, [id])

  /* ── LOADING SKELETON ── */

  if (loading) {
    return (
      <section className="product-page">
        <div className="single-product-skeleton">
          <div className="single-product-image skeleton" />
          <div>
            <div className="single-product-title skeleton" />
            <div className="single-product-price skeleton" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="single-product-text skeleton" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!product) {
    return <h1 style={{ color:"white", padding:"150px 70px" }}>Product Not Found</h1>
  }

  const isShoes = product.productCategory === "Shoes"
  const inWishlist = isInWishlist(product._id)

  /* ── WISHLIST ── */

  const handleWishlistToggle = async () => {

    try {

      if (inWishlist) {

        await removeWishlist(product._id)
        toast.success("Removed from wishlist")

      } else {

        await addToWishlist(product._id)
        toast.success("Added to wishlist")

      }

    } catch (error) {

      if (error.message !== "Not authenticated") {
        toast.error("Something went wrong, please try again")
      }

    }

  }

  /* ── ADD TO CART ── */
  /* NOTE: addToCart expects a product ID string + quantity, not the
     product object — the size selection isn't persisted by the cart
     schema yet (see README), so we just pass the ID for now. */

  const handleAddToCart = async () => {

    if (isShoes && !selectedSize) {
      toast.error("Please select a size")
      return
    }

    try {

      await addToCart(product._id, 1)
      toast.success("Added to cart")

    } catch (error) {

      if (error.message !== "Not authenticated") {
        toast.error("Could not add item to cart")
      }

    }

  }

  /* ── BUY NOW ── */

  const handleBuyNow = async () => {

    if (isShoes && !selectedSize) {
      toast.error("Please select a size")
      return
    }

    try {

      await addToCart(product._id, 1)
      navigate("/checkout")

    } catch (error) {

      if (error.message !== "Not authenticated") {
        toast.error("Could not add item to cart")
      }

    }

  }

  return (

    <>

      <Navbar />

      <section className="product-page">

        <motion.div
          className="product-container"
          initial={{ opacity:0, y:50 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.8 }}
        >

          {/* ── GALLERY ── */}

          <div className="product-gallery">

            <div className="main-product-image">
              <img
                src={selectedImage || product.images?.[0]}
                alt={product.name}
              />
            </div>

            <div className="thumbnail-images">
              {product.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="thumb"
                  className={selectedImage === img ? "active-thumb" : ""}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>

            {product.video && (
              <div className="product-video">
                <video src={product.video} controls />
              </div>
            )}

          </div>

          {/* ── INFO ── */}

          <div className="product-info">

            <span className="product-brand">{product.brand}</span>

            <h1>{product.name}</h1>

            <div className="product-price">
              ₹{product.price?.toLocaleString()}
            </div>

            <p className="product-description">
              {product.description}
            </p>

            {/* ── SIZE SECTION ── */}

            <div className="size-selection">

              <div className="size-header">
                <h3>
                  {isShoes ? "SELECT SIZE" : "SIZE"}
                </h3>
                {isShoes && (
                  <span className="size-guide-note">EU sizing</span>
                )}
              </div>

              {isShoes ? (

                /* SHOE SIZE BUTTONS */

                <div className="sizes">
                  {SHOE_SIZES.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? "active-size" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>

              ) : (

                /* FREE SIZE BADGE */

                <div className="free-size-badge">
                  FREE SIZE
                </div>

              )}

            </div>

            {/* ── BUTTONS ── */}

            <div className="product-buttons">

              <button
                className="add-cart-btn"
                onClick={handleAddToCart}
              >
                ADD TO CART
              </button>

              <button
                className="buy-now-btn"
                onClick={handleBuyNow}
              >
                BUY NOW
              </button>

              <button
                className={`wishlist-btn ${inWishlist ? "active" : ""}`}
                onClick={handleWishlistToggle}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <FiHeart />
              </button>

            </div>

            {/* ── META ── */}

            <div className="product-meta">
              <div className="meta-row">
                <span>Category</span>
                <span>{product.productCategory}</span>
              </div>
              <div className="meta-row">
                <span>Section</span>
                <span>{product.section}</span>
              </div>
              <div className="meta-row">
                <span>Brand</span>
                <span>{product.brand}</span>
              </div>
            </div>

          </div>

        </motion.div>

        {/* ── RELATED ── */}

        <RelatedProducts
          category={product.productCategory}
          currentId={product._id}
        />

      </section>

    </>

  )

}

export default Product
