import "./Products.css"

import {

  useNavigate,
  Link

} from
"react-router-dom"

import {

  motion

} from
"framer-motion"

import toast from
"react-hot-toast"

import {

  FiHeart

} from "react-icons/fi"

import {

  useCart

} from
"../../context/CartContext"

import {

  useWishlist

} from
"../../context/WishlistContext"

function ProductCard({

  product

}) {

  const navigate =
  useNavigate()

  const {

    addToCart

  } = useCart()

  const {

    isInWishlist,
    addToWishlist,
    removeWishlist

  } = useWishlist()

  const inWishlist =
  isInWishlist(product._id)

  /* TOGGLE WISHLIST */

  const handleWishlistToggle = async (e) => {

    e.stopPropagation()

    try {

      if (inWishlist) {

        await removeWishlist(product._id)

        toast.success("Removed from wishlist")

      } else {

        await addToWishlist(product._id)

        toast.success("Added to wishlist")

      }

    } catch (error) {

      /* guest guard already shows its own toast — only handle real failures here */

      if (error.message !== "Not authenticated") {

        toast.error("Something went wrong, please try again")

      }

    }

  }

  /* ADD TO CART */

  const handleAddToCart = async (e) => {

    e.stopPropagation()

    try {

      await addToCart(

        product._id,
        1

      )

      toast.success(

        "Added To Cart"

      )

    } catch (error) {

      if (error.message !== "Not authenticated") {

        toast.error("Could not add item to cart")

      }

    }

  }

  return (

    <motion.div

      className="product-card"

      whileHover={{

        y:-10

      }}

      transition={{

        duration:0.3

      }}

      onClick={() =>

        navigate(

          `/product/${product._id}`

        )

      }

    >

      {/* IMAGE */}

      <div className="product-image">

        <img

          src={

            product.images?.[0]

            ||

            "https://placehold.co/500x650?text=No+Image"

          }

          alt={product.name}

        />

        {/* WISHLIST TOGGLE */}

        <button

          className={`wishlist-toggle-btn ${inWishlist ? "active" : ""}`}

          onClick={handleWishlistToggle}

          aria-label={
            inWishlist ? "Remove from wishlist" : "Add to wishlist"
          }

        >

          <FiHeart />

        </button>

      </div>

      {/* INFO */}

      <div className="product-info">

        <span className="product-brand">

          {product.brand}

        </span>

        <h3>

          {product.name}

        </h3>

        <p>

          ₹{product.price}

        </p>

        {/* BUTTONS */}

        <div className="card-buttons">

          {/* ADD TO CART */}

          <button

            className="card-cart-btn"

            onClick={handleAddToCart}

          >

            ADD TO CART

          </button>

          {/* BUY NOW */}

          <Link

            to={`/product/${product._id}`}

            onClick={(e) =>

              e.stopPropagation()

            }

          >

            <button

              className=

              "card-buy-btn"

            >

              BUY NOW

            </button>

          </Link>

        </div>

      </div>

    </motion.div>

  )

}

export default ProductCard
