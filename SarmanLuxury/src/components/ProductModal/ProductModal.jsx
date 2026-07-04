import "./ProductModal.css"

import {
  FiX,
  FiHeart,
  FiShoppingCart
} from "react-icons/fi"

import { Link } from "react-router-dom"

import {
  useCart
} from "../../context/CartContext"

import {
  useWishlist
} from "../../context/WishlistContext"

function ProductModal({
  product,
  closeModal
}) {

  /* CART */

  const { addToCart } =
  useCart()

  /* WISHLIST */

  const { addToWishlist } =
  useWishlist()

  /* EMPTY */

  if (!product) return null

  return (

    <div className="modal-overlay">

      <div className="product-modal">

        {/* CLOSE */}

        <div
          className="close-modal"
          onClick={closeModal}
        >

          <FiX />

        </div>

        {/* IMAGE */}

        <div className="modal-image">

          <img
            src={product.image}
            alt={product.name}
          />

        </div>

        {/* INFO */}

        <div className="modal-info">

          <span className="modal-brand">

            {product.brand}

          </span>

          <h2>
            {product.name}
          </h2>

          <h3>
            ${product.price}
          </h3>

          <p>

            {product.description}

          </p>

          {/* ACTIONS */}

          <div className="modal-actions">

            {/* CART */}

            <button
              className="cart-btn"
              onClick={() =>
                addToCart(product)
              }
            >

              <FiShoppingCart />

              ADD TO CART

            </button>

            {/* BUY NOW */}

            <Link
              to={`/product/${product.id}`}
            >

              <button
                className="buy-btn"
              >

                BUY NOW

              </button>

            </Link>

            {/* WISHLIST */}

            <button
              className="wishlist-btn"
              onClick={() =>
               addToWishlist(product._id)
              }
            >

              <FiHeart />

            </button>

          </div>

        </div>

      </div>

    </div>

  )

}

export default ProductModal