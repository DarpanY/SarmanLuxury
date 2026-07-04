import "./Categories.css"

import { useEffect, useState } from "react"
import { useNavigate }        from "react-router-dom"
import API                    from "../../api/axios"
import { FiWatch, FiFeather, FiShoppingBag, FiSun } from "react-icons/fi"

const FALLBACK = [
  { _id:"f1", title:"Luxury Watches", category:"Watches",    icon: FiWatch },
  { _id:"f2", title:"Premium Shoes",  category:"Shoes",      icon: FiFeather },
  { _id:"f3", title:"Designer Bags",  category:"Bags",       icon: FiShoppingBag },
  { _id:"f4", title:"Luxury Eyewear", category:"Sunglasses", icon: FiSun },
]

function Categories() {

  const navigate = useNavigate()
  const [categories, setCategories] = useState(FALLBACK)

  useEffect(() => {
    API.get("/categories")
      .then(({ data }) => {
        if (data && data.length) setCategories(data)
      })
      .catch(() => {})
  }, [])

  const goToCategory = (category) => {
    navigate(`/collections?category=${encodeURIComponent(category)}`)
  }

  return (

    <section className="categories">

      <div className="categories-header">
        <span>SARMAN LUXURY</span>
        <h2>SHOP BY CATEGORY</h2>
      </div>

      <div className="categories-grid">

        {categories.map((item) => (

          <div
            className="category-card"
            key={item._id}
            onClick={() => goToCategory(item.category)}
          >

            {item.image ? (
              <img src={item.image} alt={item.title} />
            ) : (
              <div className="category-fallback">
                {item.icon && <item.icon />}
              </div>
            )}

            <div className="category-overlay" />

            <div className="category-content">
              <h3>{item.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToCategory(item.category)
                }}
              >
                EXPLORE →
              </button>
            </div>

          </div>

        ))}

      </div>

    </section>

  )
}

export default Categories
