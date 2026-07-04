import "./styles/Collections.css"

import {
  motion
} from "framer-motion"

import {
  useEffect,
  useState
} from "react"

import {
  useSearchParams
} from "react-router-dom"

import API from "../api/axios"

import Navbar
from "../components/Navbar/Navbar"

import ProductCard
from "../components/Products/ProductCard"

function Collections({

  defaultSection = "All"

}) {

  /* STATES */

  const [products,
  setProducts] =
  useState([])

  const [filteredProducts,
  setFilteredProducts] =
  useState([])

  const [loading,
  setLoading] =
  useState(true)

  const [search,
  setSearch] =
  useState("")

  const [productCategory,
  setProductCategory] =
  useState("All")

  const [sort,
  setSort] =
  useState("latest")

  /* DEEP-LINKED CATEGORY (from homepage category cards / footer links) */

  const [searchParams] =
  useSearchParams()

  useEffect(() => {

    const categoryFromUrl =
    searchParams.get("category")

    if (categoryFromUrl) {

      setProductCategory(
        categoryFromUrl
      )

    }

  }, [searchParams])

  /* FETCH PRODUCTS */

  useEffect(() => {

    const fetchProducts =
    async () => {

      try {

        const { data } =
        await API.get(
          "/products"
        )

        setProducts(data)

      }

      catch (error) {

        console.log(error)

      }

      finally {

        setLoading(false)

      }

    }

    fetchProducts()

  }, [])

  /* FILTER PRODUCTS */

  useEffect(() => {

    let updated =
    [...products]

    /* NAVBAR SECTION FILTER */

    if (

      defaultSection !== "All"

    ) {

      updated =
      updated.filter((item) =>

        item.section
        ?.toLowerCase()

        ===

        defaultSection
        .toLowerCase()

      )

    }

    /* SEARCH */

    if (search) {

      updated =
      updated.filter((item) =>

        item.name
        ?.toLowerCase()

        .includes(

          search.toLowerCase()

        )

      )

    }

    /* PRODUCT CATEGORY */

    if (

      productCategory !== "All"

    ) {

      updated =
      updated.filter((item) =>

        item.productCategory
        ?.toLowerCase()

        ===

        productCategory
        .toLowerCase()

      )

    }

    /* SORT */

    if (sort === "low") {

      updated.sort(

        (a,b) =>

        a.price - b.price

      )

    }

    else if (sort === "high") {

      updated.sort(

        (a,b) =>

        b.price - a.price

      )

    }

    setFilteredProducts(updated)

  },

  [

    products,
    search,
    productCategory,
    sort,
    defaultSection

  ])

  /* LOADING */

  if (loading) {

    return (

      <section className="collection-page">

        <div className="collection-grid">

          {

            [...Array(8)]

            .map((_,index) => (

              <div

                className="product-skeleton"

                key={index}

              >

                <div

                  className=
                  "product-skeleton-image skeleton"

                />

                <div

                  className=
                  "product-skeleton-title skeleton"

                />

                <div

                  className=
                  "product-skeleton-price skeleton"

                />

              </div>

            ))

          }

        </div>

      </section>

    )

  }

  return (

    <>

      <Navbar />

      <section className="collection-page">

        {/* HEADER */}

        <div className="collection-header">

          <span>

            SARMAN LUXURY

          </span>

          <h1>

            {

              defaultSection === "All"

              ?

              "COLLECTION"

              :

              defaultSection.toUpperCase()

            }

          </h1>

        </div>

        {/* FILTERS */}

        <div className="collection-filters">

          {/* SEARCH */}

          <input

            type="text"

            placeholder=
            "Search Products..."

            value={search}

            onChange={(e) =>

              setSearch(
                e.target.value
              )

            }

          />

          {/* PRODUCT CATEGORY */}

          <select

            value={productCategory}

            onChange={(e) =>

              setProductCategory(
                e.target.value
              )

            }

          >

            <option value="All">

              All

            </option>

            <option value="Shoes">

              Shoes

            </option>

            <option value="Watches">

              Watches

            </option>

            <option value="Bags">

              Bags

            </option>

            <option value="Clothing">

              Clothing

            </option>

            <option value="Sunglasses">

              Sunglasses

            </option>

            <option value="Perfume">

              Perfume

            </option>

          </select>

          {/* SORT */}

          <select

            value={sort}

            onChange={(e) =>

              setSort(
                e.target.value
              )

            }

          >

            <option value="latest">

              Latest

            </option>

            <option value="low">

              Price:
              Low To High

            </option>

            <option value="high">

              Price:
              High To Low

            </option>

          </select>

        </div>

        {/* PRODUCTS */}

        <motion.div

          className="collection-grid"

          initial={{

            opacity:0,
            y:40

          }}

          animate={{

            opacity:1,
            y:0

          }}

          transition={{

            duration:0.7

          }}

        >

          {

            filteredProducts.length > 0

            ?

            filteredProducts.map((product) => (

              <ProductCard

                key={product._id}

                product={product}

              />

            ))

            :

            <div className="no-products">

              No Products Found

            </div>

          }

        </motion.div>

      </section>

    </>

  )

}

export default Collections