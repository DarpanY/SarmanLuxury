import "./styles/Cart.css"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar/Navbar"
import {
  FiPlus,
  FiMinus,
  FiTrash2
} from "react-icons/fi"

import {
  useCart
} from "../context/CartContext"

function Cart() {

  const {

    cart,
    loading,

    removeFromCart,

    increaseQty,
    decreaseQty,

    totalPrice

  } = useCart()

  return (
    <>
    <Navbar/>
    <section className="cart-page">

      {/* TITLE */}

      <div className="cart-title">

        <span>
          SARMAN LUXURY
        </span>

        <h1>
          YOUR CART
        </h1>

      </div>

      {/* LOADING */}

      {loading ? (

        <div className="empty-cart-page">
          Loading your cart...
        </div>

      ) : (

        /* CONTAINER */

        <div className="cart-container">

          {/* LEFT */}

          <div className="cart-products">

            {cart.length === 0 ? (

              <div className="empty-cart-page">

                Your cart is empty

              </div>

            ) : (

              cart.map((item) => (

                <div
                  className="cart-product"
                  key={item.product?._id}
                >

                  {/* IMAGE */}

                  <div className="cart-product-image">

                    <img
                      src={item.product?.images?.[0] || "https://placehold.co/300x300?text=No+Image"}
                      alt={item.product?.name}
                    />

                  </div>

                  {/* INFO */}

                  <div className="cart-product-info">

                    <h2>
                      {item.product?.name}
                    </h2>

                    <span>
                      ₹{item.product?.price?.toLocaleString()}
                    </span>

                    {/* QUANTITY */}

                    <div className="cart-quantity">

                      <button
                        onClick={() =>
                          decreaseQty(item.product?._id)
                        }
                      >

                        <FiMinus />

                      </button>

                      <p>
                        {item.quantity}
                      </p>

                      <button
                        onClick={() =>
                          increaseQty(item.product?._id)
                        }
                      >

                        <FiPlus />

                      </button>

                    </div>

                  </div>

                  {/* REMOVE */}

                  <button
                    className="remove-product"
                    onClick={() =>
                      removeFromCart(item.product?._id)
                    }
                  >

                    <FiTrash2 />

                  </button>

                </div>

              ))

            )}

          </div>

          {/* RIGHT */}

          <div className="cart-summary">

            <h2>
              CART TOTALS
            </h2>

            <div className="summary-item">

              <span>
                Subtotal
              </span>

              <p>
                ₹{totalPrice.toLocaleString()}
              </p>

            </div>

            <div className="summary-item">

              <span>
                Shipping
              </span>

              <p>
                FREE
              </p>

            </div>

            <div className="summary-item total">

              <span>
                Total
              </span>

              <h3>
                ₹{totalPrice.toLocaleString()}
              </h3>

            </div>

            {cart.length > 0 && (

              <Link to="/checkout">

                <button className="checkout-page-btn">

                  PROCEED TO CHECKOUT

                </button>

              </Link>

            )}

          </div>

        </div>

      )}

    </section>
    </>
  )

}

export default Cart
