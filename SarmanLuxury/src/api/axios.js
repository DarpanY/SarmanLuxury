import axios from "axios"
import toast from "react-hot-toast"

const API = axios.create({
  baseURL: "https://sarmanluxury-api-9oz3.onrender.com/api"
})

// Auto-logout on expired/invalid token
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem("token")

      localStorage.removeItem("user")
      localStorage.removeItem("token")

      if (hadToken && window.location.pathname !== "/login") {
        toast.error("Your session has expired. Please log in again.")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default API
