import "./CartSidebar.css"

import {

  useNavigate

} from "react-router-dom"

import {

  FiX,
  FiTrash2

} from "react-icons/fi"

import {

  useCart

} from "../../context/CartContext"

function CartSidebar({

  isOpen,
  closeCart

}) {

  const {

    cart,
    removeFromCart,

    increaseQty,
    decreaseQty,

    totalPrice,
    loading

  } = useCart()

  const navigate =
  useNavigate()

  return (

    <div className={

      `cart-overlay ${

        isOpen

        ?

        "show-cart"

        :

        ""

      }`

    }>

      {/* SIDEBAR */}

      <div className="cart-sidebar">

        {/* TOP */}

        <div className="cart-top">

          <h2>

            SHOPPING CART

          </h2>

          <FiX
            onClick={closeCart}
          />

        </div>

        {/* LOADING */}

        {

          loading

          ?

          <div className="empty-cart">

            <h3>

              Loading...

            </h3>

          </div>

          :

          cart.length === 0

          ?

          <div className="empty-cart">

            <h3>

              Your cart is empty

            </h3>

          </div>

          :

          <>

            {/* ITEMS */}

            <div className="cart-items">

              {

                cart.map((item) => (

                  <div

                    className="cart-item"

                    key={

                      item?.product?._id

                    }

                  >

                    {/* IMAGE */}

                    <img

                      src={

                        item?.product?.images?.[0]

                      }

                      alt={

                        item?.product?.name

                      }

                    />

                    {/* INFO */}

                    <div className="cart-info">

                      <h3>

                        {

                          item?.product?.name

                        }

                      </h3>

                      <p>

                        ₹

                        {

                          item?.product?.price

                        }

                      </p>

                      {/* QTY */}

                      <div className=

                      "cart-qty-controls">

                        <button

                          className="incdec"

                          onClick={() =>

                            decreaseQty(

                              item?.product?._id

                            )

                          }

                        >

                          -

                        </button>

                        <span>

                          {

                            item?.quantity || 1

                          }

                        </span>

                        <button

                          className="incdec"

                          onClick={() =>

                            increaseQty(

                              item?.product?._id

                            )

                          }

                        >

                          +

                        </button>

                      </div>

                    </div>

                    {/* REMOVE */}

                    <button

                      className=
                      "remove-btn"

                      onClick={() =>

                        removeFromCart(

                          item?.product?._id

                        )

                      }

                    >

                      <FiTrash2 />

                    </button>

                  </div>

                ))

              }

            </div>

            {/* BOTTOM */}

            <div className="cart-bottom">

              {/* TOTAL */}

              <div className="cart-total">

                <h3>

                  TOTAL

                </h3>

                <p>

                  ₹{totalPrice}

                </p>

              </div>

              {/* CHECKOUT */}

              <button

                className=
                "checkout-btn"

                onClick={() => {

                  closeCart()

                  navigate(
                    "/checkout"
                  )

                }}

              >

                CHECKOUT

              </button>

            </div>

          </>

        }

      </div>

    </div>

  )

}

export default CartSidebar