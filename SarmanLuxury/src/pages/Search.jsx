import "./styles/Search.css"

import {

  useEffect,
  useState

} from "react"

import {

  useSearchParams

} from "react-router-dom"

import API from "../api/axios"

import ProductCard from "../components/Products/ProductCard"

function Search() {

  const [searchParams] =
  useSearchParams()

  const query =
  searchParams.get("q")

  const [products,
  setProducts] =
  useState([])

  const [loading,
  setLoading] =
  useState(true)

  /* FETCH */

  useEffect(() => {

    const fetchProducts =
    async () => {

      try {

        const { data } =
        await API.get(

          `/products?search=${query}`

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

  }, [query])

  return (

    <section className="search-page">

      {/* TITLE */}

      <div className="search-title">

        <span>
          SARMAN LUXURY
        </span>

        <h1>

          SEARCH RESULTS

        </h1>

        <p>

          Results for:
          "{query}"

        </p>

      </div>

      {/* LOADING */}

      {

        loading

        ?

        <h2 className="search-loading">

          Loading...

        </h2>

        :

        products.length === 0

        ?

        <div className="empty-search">

          <h2>
            No Products Found
          </h2>

        </div>

        :

        <div className="search-grid">

          {

            products.map((product) => (

              <ProductCard

                key={product._id}

                product={product}

              />

            ))

          }

        </div>

      }

    </section>

  )

}

export default Search