import "./RelatedProducts.css"

import {

  useEffect,
  useState

} from "react"

import API from "../../api/axios"

import ProductCard
from "../Products/ProductCard"

function RelatedProducts({

  category,
  currentId

}) {

  const [products,
  setProducts] =
  useState([])

  const [loading,
  setLoading] =
  useState(true)

  useEffect(() => {

    const fetchRelated =
    async () => {

      try {

        const { data } =

        await API.get(
          "/products"
        )

        const filtered =

        data.filter((item) =>

          item.productCategory
          ===
          category

          &&

          item._id
          !==
          currentId

        )

        setProducts(

          filtered.slice(0,4)

        )

      }

      catch (error) {

        console.log(error)

      }

      finally {

        setLoading(false)

      }

    }

    fetchRelated()

  },

  [

    category,
    currentId

  ])

  /* LOADING */

  if (loading) {

    return (

      <section className=

      "related-products">

        <div className=

        "related-grid">

          {

            [...Array(4)]

            .map((_,index) => (

              <div

                className=

                "product-skeleton"

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

  if (products.length === 0)
    return null

  return (

    <section className=

    "related-products">

      <div className=

      "related-header">

        <span className="Logoo">

          SARMAN LUXURY

        </span>

        <h2 className="Logoo1">

          RELATED PRODUCTS

        </h2>

      </div>

      <div className=

      "related-grid">

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

export default RelatedProducts