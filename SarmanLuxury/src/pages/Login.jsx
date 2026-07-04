import "./styles/Auth.css"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import API from "../api/axios"
import toast from "react-hot-toast"
import { FiEye, FiEyeOff } from "react-icons/fi"

function Login() {

  const navigate = useNavigate()
  const { user, login } = useAuth()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  /* REDIRECT IF ALREADY LOGGED IN */

  useEffect(() => {
    if (user) navigate("/profile")
  }, [user, navigate])

  /* SUBMIT */

  const handleLogin = async (e) => {

    e.preventDefault()

    try {

      setLoading(true)

      const { data } = await API.post(
        "/auth/login",
        { email, password }
      )

      login(data.user, data.token)

      toast.success(`Welcome back, ${data.user.name}!`)

      /* Redirect admins to admin panel */
      if (
        data.user.role === "superadmin" ||
        data.user.role === "admin" ||
        data.user.role === "staff"
      ) {
        navigate("/admin")
      } else {
        navigate("/")
      }

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Invalid credentials"
      )

    } finally {

      setLoading(false)

    }

  }

  return (

    <section className="auth-page">

      <div className="auth-container">

        {/* LEFT */}

        <div className="auth-left">

          <span>SARMAN LUXURY</span>

          <h1>Welcome Back</h1>

          <p>
            Sign in to continue your
            premium shopping experience.
          </p>

          <div className="auth-left-footer">
            <p>New to Sarman?</p>
            <Link to="/register" className="auth-left-link">
              Create an account →
            </Link>
          </div>

        </div>

        {/* RIGHT */}

        <div className="auth-right">

          <h2>LOGIN</h2>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="auth-input">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* PASSWORD */}

            <div className="auth-input">
              <label>Password</label>
              <div className="input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                "LOGIN"
              )}
            </button>

          </form>

          <p className="auth-switch">
            Don't have an account?
            <Link to="/register">Register</Link>
          </p>

        </div>

      </div>

    </section>

  )

}

export default Login
