import "./Navbar.css"

import {
  Link,
  useNavigate
} from "react-router-dom"

import logo from
"../../assets/images/logo.png"

import {
  useState,
  useEffect
} from "react"

import API from "../../api/axios"

import CartSidebar
from "../CartSidebar/CartSidebar"

import {
  useCart
} from "../../context/CartContext"

import {

  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiMenu,
  FiX

} from "react-icons/fi"

function Navbar() {

  /* CART */

  const [isCartOpen,
  setIsCartOpen] =
  useState(false)

const {

  cart = []

} = useCart()

  /* MOBILE */

  const [menuOpen,
  setMenuOpen] =
  useState(false)

  /* SEARCH */

  const [search,
  setSearch] =
  useState("")

  const [results,
  setResults] =
  useState([])

  const [showResults,
  setShowResults] =
  useState(false)

  const navigate =
  useNavigate()

  /* LIVE SEARCH */

  useEffect(() => {

    const fetchSearch =
    async () => {

      if (!search) {

        setResults([])

        return

      }

      try {

        const { data } =
        await API.get(

          `/products?search=${search}`

        )

        setResults(data)

      }

      catch (error) {

        console.log(error)

      }

    }

    const delay =
    setTimeout(() => {

      fetchSearch()

    }, 300)

    return () =>
    clearTimeout(delay)

  }, [search])

  return (

    <>

      {/* TOP BAR */}

      <div className="top-bar">

        <p>

          FREE SHIPPING ON
          PREPAID ORDERS

        </p>

      </div>

      {/* NAVBAR */}

      <nav className="navbar">

        {/* MOBILE MENU */}

        <div

          className="mobile-menu-icon"

          onClick={() =>
            setMenuOpen(true)
          }

        >

          <FiMenu />

        </div>

        {/* LOGO */}

        <Link
          to="/"
          className="logo"
        >

          <img
            src={logo}
            alt="Sarman Luxury"
          />

        </Link>

        {/* LINKS */}

        <ul className="nav-links">

          <li>
            <Link to="/">
              HOME
            </Link>
          </li>

          <li>
            <Link to="/collections">
              COLLECTIONS
            </Link>
          </li>

          <li>
            <Link to="/men">
              MEN
            </Link>
          </li>

          <li>
            <Link to="/women">
              WOMEN
            </Link>
          </li>

          <li>
            <Link to="/accessories">
              ACCESSORIES
            </Link>
          </li>

          <li>
            <Link to="/contact">
              CONTACT
            </Link>
          </li>

        </ul>

        {/* RIGHT */}

        <div className="nav-icons">

          {/* SEARCH */}

          <div className="search-container">

            <div className="search-box">

              <input

                type="text"

                placeholder=
                "Search luxury..."

                value={search}

                onChange={(e) => {

                  setSearch(
                    e.target.value
                  )

                  setShowResults(true)

                }}

                onKeyDown={(e) => {

                  if (
                    e.key === "Enter"
                  ) {

                    navigate(

                      `/search?q=${search}`

                    )

                    setShowResults(false)

                  }

                }}

              />

              <FiSearch />

            </div>

            {/* RESULTS */}

            {

              showResults

              &&

              results.length > 0

              &&

              <div className="search-results">

                {

                  results

                  .slice(0,5)

                  .map((item) => (

                    <div

                      className=
                      "search-item"

                      key={item._id}

                      onClick={() => {

                        navigate(

                          `/product/${item._id}`

                        )

                        setSearch("")

                        setShowResults(false)

                      }}

                    >

                      <img
                        src={item.images?.[0]}
                        alt={item.name}
                      />

                      <div>

                        <h4>

                          {item.name}

                        </h4>

                        <p>

                          ₹{item.price}

                        </p>

                      </div>

                    </div>

                  ))

                }

              </div>

            }

          </div>

          {/* USER */}

          <Link to="/login">

            <button className="auth">

              <FiUser />

            </button>

          </Link>

          {/* WISHLIST */}

          <Link to="/wishlist">

            <button className="auth">

              <FiHeart />

            </button>

          </Link>

          {/* CART */}

          <div

            className="nav-cart"

            onClick={() =>
              setIsCartOpen(true)
            }

          >

            <FiShoppingBag />

            <span>

              {cart.length}

            </span>

          </div>

        </div>

      </nav>

      {/* MOBILE SIDEBAR */}

      <div className={

        `mobile-sidebar ${
          menuOpen
          ? "show-menu"
          : ""
        }`

      }>

        <div className="mobile-top">

          <FiX
            onClick={() =>
              setMenuOpen(false)
            }
          />

        </div>

        <ul>

          <li>

            <Link to="/">
              HOME
            </Link>

          </li>

          <li>

            <Link to="/collections">
              COLLECTIONS
            </Link>

          </li>

          <li>

            <Link to="/men">
              MEN
            </Link>

          </li>

          <li>

            <Link to="/women">
              WOMEN
            </Link>

          </li>

          <li>

            <Link to="/accessories">
              ACCESSORIES
            </Link>

          </li>

          <li>

            <Link to="/wishlist">
              WISHLIST
            </Link>

          </li>

          <li>

            <Link to="/orders">
              ORDERS
            </Link>

          </li>

        </ul>

      </div>

      {/* CART */}

      <CartSidebar

        isOpen={isCartOpen}

        closeCart={() =>

          setIsCartOpen(false)

        }

      />

    </>

  )

}

export default Navbar