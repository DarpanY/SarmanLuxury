import "./styles/Orders.css"
import Navbar from "../components/Navbar/Navbar"
import {

  useEffect,
  useState

} from "react"

import API from "../api/axios"

import {

  useAuth

} from "../context/AuthContext"

function Orders() {

  const { token } =
  useAuth()

  const [orders, setOrders] =
  useState([])

  const [loading, setLoading] =
  useState(true)

  /* FETCH */

  useEffect(() => {

    const fetchOrders =
    async () => {

      try {

        const { data } =
        await API.get(

          "/orders/my-orders",

          {

            headers:{

              Authorization:
              `Bearer ${token}`

            }

          }

        )

        setOrders(data)

      }

      catch (error) {

        console.log(error)

      }

      finally {

        setLoading(false)

      }

    }

    fetchOrders()

  }, [token])

  return (
    <>
    <Navbar/>
    <section className="orders-page">

      {/* TITLE */}

      <div className="orders-title">

        <span>
          SARMAN LUXURY
        </span>

        <h1>
          MY ORDERS
        </h1>

      </div>

      {/* LOADING */}

      {

        loading

        ?

        <h2 className="loading-orders">

          Loading...

        </h2>

        :

        orders.length === 0

        ?

        <div className="empty-orders">

          <h2>
            No Orders Yet
          </h2>

        </div>

        :

        <div className="orders-grid">

          {

            orders.map((order) => (

              <div
                className="order-card"

                key={order._id}
              >

                <div className="order-top">

                  <h3>

                    Order ID

                  </h3>

                  <span>

                    {
                      order.orderStatus
                    }

                  </span>

                </div>

                <p>

                  {
                    order.shippingAddress
                    ?.city
                  }

                  ,

                  {

                    order.shippingAddress
                    ?.country

                  }

                </p>

                <h2>

                  ₹
                  {
                    order.totalPrice
                  }

                </h2>

                <small>

                  {
                    new Date(

                      order.createdAt

                    ).toLocaleDateString()
                  }

                </small>

              </div>

            ))

          }

        </div>

      }

    </section>
      </>
  )

}

export default Orders