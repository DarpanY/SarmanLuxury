import "./styles/Wishlist.css"
import Navbar from "../components/Navbar/Navbar"
import {

  Link

} from "react-router-dom"

import {

  FiTrash2

} from "react-icons/fi"

import {

  useWishlist

} from "../context/WishlistContext"

function Wishlist() {

  const {

    wishlistItems,
    removeWishlist

  } = useWishlist()

  return (
    <>
    <Navbar/>
    <section className="wishlist-page">

      {/* TITLE */}

      <div className="wishlist-title">

        <span>
          SARMAN LUXURY
        </span>

        <h1>
          MY WISHLIST
        </h1>

      </div>

      {/* EMPTY */}

      {

        wishlistItems.length === 0

        ?

        <div className="empty-wishlist">

          <h2>
            Your wishlist is empty
          </h2>

          <Link to="/collections">

            <button>

              SHOP NOW

            </button>

          </Link>

        </div>

        :

        <div className="wishlist-grid">

          {

            wishlistItems.map((item) => (

              <div
                className="wishlist-card"

                key={item._id}
              >

                {/* IMAGE */}

                <img
                  src={item.images?.[0] || "https://placehold.co/300x300?text=No+Image"}
                  alt={item.name}
                />

                {/* INFO */}

                <div className="wishlist-info">

                  <h3>

                    {item.name}

                  </h3>

                  <p>

                    ₹{item.price}

                  </p>

                  {/* ACTIONS */}

                  <div className="wishlist-actions">

                    <Link
                      to={`/product/${item._id}`}
                    >

                      <button>

                        VIEW PRODUCT

                      </button>

                    </Link>

                    <button

                      className=
                      "remove-wishlist"

                      onClick={() =>

                        removeWishlist(
                          item._id
                        )

                      }
                    >

                      <FiTrash2 />

                    </button>

                  </div>

                </div>

              </div>

            ))

          }

        </div>

      }

    </section>
      </>
  )

}

export default Wishlist