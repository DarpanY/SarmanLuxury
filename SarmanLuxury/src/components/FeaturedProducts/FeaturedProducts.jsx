import "./FeaturedProducts.css"

import {

  useEffect,
  useState

} from "react"

import API from "../../api/axios"

import ProductCard
from "../Products/ProductCard"

function FeaturedProducts() {

  const [products,
  setProducts] =
  useState([])

  /* FETCH */

  useEffect(() => {

    const fetchFeatured =
    async () => {

      try {

        const { data } =
        await API.get(

          "/products?featured=true"

        )

        setProducts(data)

      }

      catch (error) {

        console.log(error)

      }

    }

    fetchFeatured()

  }, [])

  return (

    <section className="featured-products">

      {/* TITLE */}

      <div className="featured-title">

        <span>
          SARMAN LUXURY
        </span>

        <h2>
          FEATURED PRODUCTS
        </h2>

      </div>

      {/* GRID */}

      <div className="featured-grid">

        {

          products.map((product) => (

            <ProductCard

              key={product._id}

              product={product}

            />

          ))

        }

      </div>

    </section>

  )

}

export default FeaturedProducts