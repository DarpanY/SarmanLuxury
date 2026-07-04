import {

  createContext,
  useContext,
  useState,
  useEffect

} from "react"

import API from "../api/axios"

import toast from "react-hot-toast"

import {

  useAuth

} from "./AuthContext"

const CartContext =
createContext()

export const CartProvider = ({
  children
}) => {

  const {

    token

  } = useAuth()

  const [cart,
  setCart] =
  useState([])

  const [loading,
  setLoading] =
  useState(true)

  /* FETCH CART */

  const fetchCart =
  async () => {

    if (!token) {

      setCart([])

      setLoading(false)

      return

    }

    try {

      const { data } =

      await API.get(

        "/cart",

        {

          headers:{

            Authorization:
            `Bearer ${token}`

          }

        }

      )

      setCart(

        data.items || []

      )

    }

    catch (error) {

      console.log(error)

    }

    finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    fetchCart()

  }, [token])

  /* ADD */

  const addToCart =
  async (

    productId,
    quantity = 1

  ) => {

    /* GUEST GUARD — backend requires login, fail loudly instead of silently */

    if (!token) {

      toast.error(
        "Please login to add items to your cart"
      )

      throw new Error("Not authenticated")

    }

    try {

      const { data } =

      await API.post(

        "/cart",

        {

          productId,
          quantity

        },

        {

          headers:{

            Authorization:
            `Bearer ${token}`

          }

        }

      )

      setCart(
        data.items
      )

    }

    catch (error) {

      console.log(error)

      throw error

    }

  }

  /* REMOVE */

  const removeFromCart =
  async (productId) => {

    try {

      const { data } =

      await API.delete(

        `/cart/${productId}`,

        {

          headers:{

            Authorization:
            `Bearer ${token}`

          }

        }

      )

      setCart(
        data.items
      )

    }

    catch (error) {

      console.log(error)

      throw error

    }

  }

  /* INCREASE */

  const increaseQty =
  async (productId) => {

    try {

      const { data } =

      await API.put(

        `/cart/${productId}`,

        {

          action:"increase"

        },

        {

          headers:{

            Authorization:
            `Bearer ${token}`

          }

        }

      )

      setCart(
        data.items
      )

    }

    catch (error) {

      console.log(error)

      throw error

    }

  }

  /* DECREASE */

  const decreaseQty =
  async (productId) => {

    try {

      const { data } =

      await API.put(

        `/cart/${productId}`,

        {

          action:"decrease"

        },

        {

          headers:{

            Authorization:
            `Bearer ${token}`

          }

        }

      )

      setCart(
        data.items
      )

    }

    catch (error) {

      console.log(error)

      throw error

    }

  }

  /* CLEAR */

  const clearCart =
  async () => {

    try {

      await API.delete(

        "/cart",

        {

          headers:{

            Authorization:
            `Bearer ${token}`

          }

        }

      )

      setCart([])

    }

    catch (error) {

      console.log(error)

      throw error

    }

  }

  /* TOTAL */

  const totalPrice =

    cart.reduce(

      (acc,item) =>

        acc +

        (

          (item?.product?.price || 0)

          *

          (item?.quantity || 1)

        ),

      0

    )

  return (

    <CartContext.Provider

      value={{

        cart,
        loading,

        addToCart,
        removeFromCart,

        increaseQty,
        decreaseQty,

        clearCart,

        totalPrice

      }}

    >

      {children}

    </CartContext.Provider>

  )

}

export const useCart = () =>
useContext(CartContext)