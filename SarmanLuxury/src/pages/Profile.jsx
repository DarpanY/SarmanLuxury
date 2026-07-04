import "./styles/Profile.css"
import Navbar from "../components/Navbar/Navbar"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import API from "../api/axios"
import toast from "react-hot-toast"
import {
  FiUser,
  FiShoppingBag,
  FiHeart,
  FiLock,
  FiLogOut,
  FiEdit2,
  FiCheck,
  FiX
} from "react-icons/fi"

function Profile() {

  const navigate  = useNavigate()
  const { user, token, login, logout } = useAuth()

  const H = { headers:{ Authorization:`Bearer ${token}` } }

  /* ── TABS ── */

  const [tab, setTab] = useState("profile")

  /* ── PROFILE STATE ── */

  const [name,  setName]  = useState(user?.name  || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile,  setSavingProfile]  = useState(false)

  /* ── PASSWORD STATE ── */

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword,     setNewPassword]     = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword,  setSavingPassword]  = useState(false)

  /* ── ORDERS STATE ── */

  const [orders,       setOrders]       = useState([])
  const [loadingOrders,setLoadingOrders] = useState(false)

  /* ── FETCH PROFILE (sync latest from DB) ── */

  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/auth/profile", H)
        setName(data.name)
        setPhone(data.phone || "")
      } catch {}
    }

    fetchProfile()

  }, [])

  /* ── FETCH ORDERS when tab opens ── */

  useEffect(() => {

    if (tab !== "orders") return

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true)
        const { data } = await API.get("/orders/my-orders", H)
        setOrders(data)
      } catch {
        toast.error("Failed to load orders")
      } finally {
        setLoadingOrders(false)
      }
    }

    fetchOrders()

  }, [tab])

  /* ── SAVE PROFILE ── */

  const saveProfile = async () => {

    try {

      setSavingProfile(true)

      const { data } = await API.put(
        "/auth/profile",
        { name, phone },
        H
      )

      /* Update AuthContext so navbar etc refresh */
      login(data.user, token)

      toast.success("Profile updated")
      setEditingProfile(false)

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Failed to update profile"
      )

    } finally {

      setSavingProfile(false)

    }

  }

  /* ── CANCEL EDIT ── */

  const cancelEdit = () => {
    setName(user?.name  || "")
    setPhone(user?.phone || "")
    setEditingProfile(false)
  }

  /* ── CHANGE PASSWORD ── */

  const savePassword = async (e) => {

    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {

      setSavingPassword(true)

      await API.put(
        "/auth/change-password",
        { currentPassword, newPassword },
        H
      )

      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Failed to change password"
      )

    } finally {

      setSavingPassword(false)

    }

  }

  /* ── LOGOUT ── */

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  /* ── STATUS COLOR ── */

  const statusClass = (s) => {
    const map = {
      Processing: "status-processing",
      Shipped:    "status-shipped",
      Delivered:  "status-delivered",
      Cancelled:  "status-cancelled"
    }
    return map[s] || ""
  }

  /* ── MENU ── */

  const menuItems = [
    { id:"profile",  label:"Profile",         icon:<FiUser /> },
    { id:"orders",   label:"My Orders",        icon:<FiShoppingBag /> },
    { id:"wishlist", label:"Wishlist",          icon:<FiHeart /> },
    { id:"password", label:"Change Password",  icon:<FiLock /> },
  ]

  return (
    <>
      <Navbar />

      <section className="profile-page">

        {/* ── SIDEBAR ── */}

        <div className="profile-sidebar">

          <div className="profile-user">

            <div className="profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>

            <h3>{user?.name}</h3>

            <p className="profile-role">
              {user?.role === "user"
                ? "PREMIUM MEMBER"
                : user?.role?.toUpperCase()}
            </p>

            <p className="profile-email-small">
              {user?.email}
            </p>

          </div>

          <ul className="profile-menu">

            {menuItems.map((item) => (
              <li
                key={item.id}
                className={tab === item.id ? "active" : ""}
                onClick={() => {
                  if (item.id === "wishlist") {
                    navigate("/wishlist")
                  } else {
                    setTab(item.id)
                  }
                }}
              >
                {item.icon}
                {item.label}
              </li>
            ))}

            <li className="logout-item" onClick={handleLogout}>
              <FiLogOut />
              Logout
            </li>

          </ul>

        </div>

        {/* ── CONTENT ── */}

        <div className="profile-content">

          <div className="profile-title">
            <span>SARMAN LUXURY</span>
            <h1>
              {tab === "profile"  && "MY ACCOUNT"}
              {tab === "orders"   && "MY ORDERS"}
              {tab === "password" && "CHANGE PASSWORD"}
            </h1>
          </div>

          {/* ════ PROFILE TAB ════ */}

          {tab === "profile" && (

            <div className="profile-box">

              <div className="profile-box-header">
                <h2>PERSONAL INFORMATION</h2>

                {!editingProfile ? (
                  <button
                    className="edit-profile-btn"
                    onClick={() => setEditingProfile(true)}
                  >
                    <FiEdit2 /> EDIT
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button
                      className="save-btn"
                      onClick={saveProfile}
                      disabled={savingProfile}
                    >
                      <FiCheck />
                      {savingProfile ? "SAVING..." : "SAVE"}
                    </button>
                    <button
                      className="cancel-edit-btn"
                      onClick={cancelEdit}
                    >
                      <FiX /> CANCEL
                    </button>
                  </div>
                )}
              </div>

              <div className="profile-grid">

                <div className="profile-input">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    readOnly={!editingProfile}
                    className={editingProfile ? "editable" : ""}
                  />
                </div>

                <div className="profile-input">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="read-only-field"
                  />
                  <small className="field-note">Email cannot be changed</small>
                </div>

                <div className="profile-input">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={editingProfile ? "Enter phone number" : "Not set"}
                    readOnly={!editingProfile}
                    className={editingProfile ? "editable" : ""}
                  />
                </div>

                <div className="profile-input">
                  <label>Member Since</label>
                  <input
                    type="text"
                    value={
                      user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                            year:"numeric", month:"long", day:"numeric"
                          })
                        : "—"
                    }
                    readOnly
                    className="read-only-field"
                  />
                </div>

              </div>

            </div>

          )}

          {/* ════ ORDERS TAB ════ */}

          {tab === "orders" && (

            <div className="profile-orders">

              {loadingOrders ? (

                <div className="profile-loading">Loading orders...</div>

              ) : orders.length === 0 ? (

                <div className="profile-empty">
                  <FiShoppingBag size={48} />
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders.</p>
                  <button onClick={() => navigate("/collections")}>
                    SHOP NOW
                  </button>
                </div>

              ) : (

                <div className="profile-orders-list">

                  {orders.map((order) => (

                    <div className="profile-order-card" key={order._id}>

                      <div className="profile-order-header">

                        <div>
                          <p className="order-id">
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="order-date">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              year:"numeric", month:"short", day:"numeric"
                            })}
                          </p>
                        </div>

                        <div className="order-header-right">
                          <span className={`status-badge ${statusClass(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                          <p className="order-amount">
                            ₹{order.totalPrice?.toLocaleString()}
                          </p>
                        </div>

                      </div>

                      <div className="profile-order-items">
                        {order.orderItems?.map((item, i) => (
                          <div className="profile-order-item" key={i}>
                            <img
                              src={item.product?.images?.[0] || ""}
                              alt={item.product?.name}
                            />
                            <div>
                              <p>{item.product?.name || "Product"}</p>
                              <p className="item-qty">
                                Qty: {item.quantity} ·{" "}
                                ₹{item.product?.price?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="profile-order-footer">
                        <div className="order-address">
                          <span>📦</span>
                          <span>
                            {order.shippingAddress?.fullName},{" "}
                            {order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.state}
                          </span>
                        </div>
                        <span className="order-payment-method">
                          {order.paymentMethod}
                        </span>
                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          )}

          {/* ════ PASSWORD TAB ════ */}

          {tab === "password" && (

            <div className="profile-box">

              <h2>CHANGE PASSWORD</h2>

              <form
                className="password-form"
                onSubmit={savePassword}
              >

                <div className="profile-input">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="editable"
                  />
                </div>

                <div className="profile-input">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="editable"
                  />
                </div>

                <div className="profile-input">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`editable ${
                      confirmPassword && confirmPassword !== newPassword
                        ? "input-error"
                        : ""
                    }`}
                  />
                  {confirmPassword && confirmPassword !== newPassword && (
                    <small className="field-error">Passwords do not match</small>
                  )}
                </div>

                <button
                  type="submit"
                  className="save-password-btn"
                  disabled={
                    savingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    newPassword !== confirmPassword
                  }
                >
                  {savingPassword ? "CHANGING..." : "CHANGE PASSWORD"}
                </button>

              </form>

            </div>

          )}

        </div>

      </section>
    </>
  )

}

export default Profile
