import "./BestSeller.css"

import {

  useEffect,
  useState

} from "react"

import API from "../../api/axios"

import ProductCard
from "../Products/ProductCard"

function BestSeller() {

  const [products,
  setProducts] =
  useState([])

  /* FETCH */

  useEffect(() => {

    const fetchBestSellers =
    async () => {

      try {

        const { data } =
        await API.get(

          "/products?bestSeller=true"

        )

        setProducts(data)

      }

      catch (error) {

        console.log(error)

      }

    }

    fetchBestSellers()

  }, [])

  return (

    <section className="featured-products">

      {/* TITLE */}

      <div className="featured-title">

        <span>
          SARMAN LUXURY
        </span>

        <h2>
          BEST SELLERS
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

export default BestSeller
