import "./styles/Auth.css"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import API from "../api/axios"
import toast from "react-hot-toast"
import { FiEye, FiEyeOff } from "react-icons/fi"

function Register() {

  const navigate = useNavigate()
  const { user, login } = useAuth()

  const [name,     setName]     = useState("")
  const [phone,    setPhone]    = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  /* REDIRECT IF ALREADY LOGGED IN */

  useEffect(() => {
    if (user) navigate("/profile")
  }, [user, navigate])

  /* SUBMIT */

  const handleRegister = async (e) => {

    e.preventDefault()

    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {

      setLoading(true)

      /* REGISTER */
      await API.post("/auth/register", {
        name,
        phone,
        email,
        password
      })

      /* AUTO LOGIN after register */
      const { data } = await API.post(
        "/auth/login",
        { email, password }
      )

      login(data.user, data.token)

      toast.success(`Welcome to Sarman Luxury, ${data.user.name}!`)

      navigate("/")

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Registration failed"
      )

    } finally {

      setLoading(false)

    }

  }

  const passwordsMatch =
    confirm.length > 0 &&
    password === confirm

  const passwordsMismatch =
    confirm.length > 0 &&
    password !== confirm

  return (

    <section className="auth-page">

      <div className="auth-container">

        {/* LEFT */}

        <div className="auth-left">

          <span>SARMAN LUXURY</span>

          <h1>Create Account</h1>

          <p>
            Join the world of premium
            luxury shopping and unlock
            exclusive member benefits.
          </p>

          <div className="auth-left-footer">
            <p>Already a member?</p>
            <Link to="/login" className="auth-left-link">
              Sign in →
            </Link>
          </div>

        </div>

        {/* RIGHT */}

        <div className="auth-right">

          <h2>REGISTER</h2>

          <form onSubmit={handleRegister}>

            {/* NAME */}

            <div className="auth-input">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* PHONE */}

            <div className="auth-input">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

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
                  placeholder="Create a password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
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

            {/* CONFIRM PASSWORD */}

            <div className="auth-input">
              <label>Confirm Password</label>
              <div className={`input-wrap ${passwordsMismatch ? "input-error-wrap" : ""} ${passwordsMatch ? "input-ok-wrap" : ""}`}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                {passwordsMatch && (
                  <span className="pass-ok">✓</span>
                )}
                {passwordsMismatch && (
                  <span className="pass-err">✗</span>
                )}
              </div>
              {passwordsMismatch && (
                <small className="auth-field-error">
                  Passwords do not match
                </small>
              )}
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-btn"
              disabled={loading || passwordsMismatch}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?
            <Link to="/login">Login</Link>
          </p>

        </div>

      </div>

    </section>

  )

}

export default Register
