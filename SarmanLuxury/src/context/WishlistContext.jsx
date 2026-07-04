import {

  createContext,
  useContext,
  useEffect,
  useState

} from "react"

import API from "../api/axios"

import toast from "react-hot-toast"

import {

  useAuth

} from "./AuthContext"

const WishlistContext =
createContext()

export function WishlistProvider({
  children
}) {

  const { token } =
  useAuth()

  const [wishlistItems,
  setWishlistItems] =
  useState([])

  /* FETCH */

  useEffect(() => {

    const fetchWishlist =
    async () => {

      if (!token) return

      try {

        const { data } =
        await API.get(

          "/wishlist",

          {

            headers:{

              Authorization:
              `Bearer ${token}`

            }

          }

        )

        setWishlistItems(

          data.products || []

        )

      }

      catch (error) {

        console.log(error)

      }

    }

    fetchWishlist()

  }, [token])

  /* ADD */

  const addToWishlist =
  async (productId) => {

    /* GUEST GUARD */

    if (!token) {

      toast.error(
        "Please login to add items to your wishlist"
      )

      throw new Error("Not authenticated")

    }

    try {

      await API.post(

        "/wishlist",

        {

          productId

        },

        {

          headers:{

            Authorization:
            `Bearer ${token}`

          }

        }

      )

      /* REFRESH */

      const { data } =
      await API.get(

        "/wishlist",

        {

          headers:{

            Authorization:
            `Bearer ${token}`

          }

        }

      )

      setWishlistItems(
        data.products
      )

    }

    catch (error) {

      console.log(error)

      throw error

    }

  }

  /* REMOVE */

  const removeWishlist =
  async (productId) => {

    try {

      await API.delete(

        `/wishlist/${productId}`,

        {

          headers:{

            Authorization:
            `Bearer ${token}`

          }

        }

      )

      setWishlistItems(

        wishlistItems.filter(

          (item) =>

            item._id !== productId

        )

      )

    }

    catch (error) {

      console.log(error)

      throw error

    }

  }

  /* CHECK */

  const isInWishlist =
  (productId) =>

    wishlistItems.some(
      (item) => item._id === productId
    )

  return (

    <WishlistContext.Provider
      value={{

        wishlistItems,

        addToWishlist,

        removeWishlist,

        isInWishlist

      }}
    >

      {children}

    </WishlistContext.Provider>

  )

}

export const useWishlist =
() => useContext(WishlistContext)