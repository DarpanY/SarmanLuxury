import "./styles/Admin.css"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

/* ─── ROLE CONSTANTS ─── */

const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN:      "admin",
  STAFF:      "staff",
  USER:       "user"
}

function canDo(role, action) {
  const perms = {
    viewDashboard:    [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF],
    viewOrders:       [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF],
    updateOrderStatus:[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF],
    viewUsers:        [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF],
    changeUserRole:   [ROLES.SUPERADMIN, ROLES.ADMIN],
    deleteUser:       [ROLES.SUPERADMIN, ROLES.ADMIN],
    viewMessages:     [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF],
    deleteMessage:    [ROLES.SUPERADMIN, ROLES.ADMIN],
    viewAbandoned:    [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF],
    addProduct:       [ROLES.SUPERADMIN],
    editProduct:      [ROLES.SUPERADMIN, ROLES.ADMIN],
    deleteProduct:    [ROLES.SUPERADMIN],
    manageCoupons:    [ROLES.SUPERADMIN],
  }
  return perms[action]?.includes(role) ?? false
}


/* ══════════════════════════════
   PURE CSS CHART COMPONENTS
   (no external dependencies)
══════════════════════════════ */

function CssBarChart({ data=[], valueKey, labelKey, color="#c8a45d", formatValue, formatLabel }) {
  if (!data.length) return <p className="no-data" style={{padding:"20px 0"}}>No data yet.</p>
  const max = Math.max(...data.map(d => d[valueKey] || 0)) || 1
  return (
    <div className="css-bar-chart">
      <div className="css-bars">
        {data.map((d, i) => {
          const pct = ((d[valueKey] || 0) / max) * 100
          return (
            <div className="css-bar-col" key={i}>
              <div className="css-bar-tooltip">
                {formatValue ? formatValue(d[valueKey]) : d[valueKey]}
              </div>
              <div className="css-bar-track">
                <div
                  className="css-bar-fill"
                  style={{ height: pct+"%", background: color }}
                />
              </div>
              <span className="css-bar-label">
                {formatLabel ? formatLabel(d[labelKey]) : d[labelKey]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CssHBarChart({ data=[], valueKey, labelKey, color="#c8a45d", formatValue }) {
  if (!data.length) return <p className="no-data" style={{padding:"20px 0"}}>No data yet.</p>
  const max = Math.max(...data.map(d => d[valueKey] || 0)) || 1
  return (
    <div className="css-hbar-chart">
      {data.map((d, i) => {
        const pct = ((d[valueKey] || 0) / max) * 100
        return (
          <div className="css-hbar-row" key={i}>
            <span className="css-hbar-label">{d[labelKey]}</span>
            <div className="css-hbar-track">
              <div
                className="css-hbar-fill"
                style={{ width: pct+"%", background: color }}
              />
            </div>
            <span className="css-hbar-value">
              {formatValue ? formatValue(d[valueKey]) : d[valueKey]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function CssDonutList({ data=[], valueKey, labelKey, colors=[], formatValue }) {
  if (!data.length) return <p className="no-data" style={{padding:"20px 0"}}>No data yet.</p>
  const total = data.reduce((a, d) => a + (d[valueKey] || 0), 0) || 1
  return (
    <div className="css-donut-list">
      {data.map((d, i) => {
        const pct = Math.round(((d[valueKey] || 0) / total) * 100)
        const clr = colors[i % colors.length]
        return (
          <div className="css-donut-row" key={i}>
            <span className="css-donut-dot" style={{ background: clr }} />
            <span className="css-donut-label">{d[labelKey]}</span>
            <div className="css-donut-bar-track">
              <div
                className="css-donut-bar-fill"
                style={{ width: pct+"%", background: clr }}
              />
            </div>
            <span className="css-donut-pct">{pct}%</span>
            <span className="css-donut-val">
              {formatValue ? formatValue(d[valueKey]) : d[valueKey]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Admin() {

  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("dashboard")
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [messages, setMessages] = useState([])
  const [abandoned, setAbandoned] = useState([])
  const [openMessage, setOpenMessage] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  /* ── COUPON STATE ── */
  const [coupons,       setCoupons]       = useState([])
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponForm,    setCouponForm]    = useState({
    code:"", discountType:"percentage", discountValue:"",
    minOrderAmount:"", maxDiscount:"", usageLimit:"", expiresAt:""
  })
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [couponFormOpen, setCouponFormOpen] = useState(false)

  /* ── TESTIMONIAL STATE ── */
  const [testimonials,        setTestimonials]        = useState([])
  const [testimonialLoading,  setTestimonialLoading]  = useState(false)
  const [testimonialForm,     setTestimonialForm]     = useState({
    name:"", role:"Customer", message:"", rating:5,
    avatar:"", isVisible:true, order:0
  })
  const [editingTestimonial,  setEditingTestimonial]  = useState(null)
  const [testimonialFormOpen, setTestimonialFormOpen] = useState(false)

  /* ── CATEGORY STATE ── */
  const [categories,       setCategories]       = useState([])
  const [categoryLoading,  setCategoryLoading]  = useState(false)
  const [categoryForm,     setCategoryForm]     = useState({
    title:"", category:"", image:"", isVisible:true, order:0
  })
  const [editingCategory,  setEditingCategory]  = useState(null)
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [catUploading,     setCatUploading]     = useState(false)

  const role = user?.role

  const H = {
    headers:{ Authorization:`Bearer ${token}` }
  }

  /* ── FETCH ANALYTICS ── */

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const { data } = await API.get("/admin/analytics", H)
      setAnalytics(data)
    } catch {
      toast.error("Failed to load analytics")
    } finally {
      setAnalyticsLoading(false)
    }
  }

  /* ── FETCH COUPONS ── */

  const fetchCoupons = async () => {
    try {
      setCouponLoading(true)
      const { data } = await API.get("/coupons", H)
      setCoupons(data)
    } catch {
      toast.error("Failed to load coupons")
    } finally {
      setCouponLoading(false)
    }
  }

  const handleCouponSubmit = async () => {

    if (!couponForm.code || !couponForm.discountValue) {
      toast.error("Code and Discount Value are required")
      return
    }

    try {

      const payload = {
        ...couponForm,
        discountValue:  Number(couponForm.discountValue),
        minOrderAmount: Number(couponForm.minOrderAmount) || 0,
        maxDiscount:    couponForm.maxDiscount    ? Number(couponForm.maxDiscount)    : null,
        usageLimit:     couponForm.usageLimit     ? Number(couponForm.usageLimit)     : null,
        expiresAt:      couponForm.expiresAt      || null,
      }

      if (editingCoupon) {
        await API.put(`/coupons/${editingCoupon._id}`, payload, H)
        toast.success("Coupon updated")
      } else {
        await API.post("/coupons", payload, H)
        toast.success("Coupon created")
      }

      setCouponForm({ code:"", discountType:"percentage", discountValue:"", minOrderAmount:"", maxDiscount:"", usageLimit:"", expiresAt:"" })
      setEditingCoupon(null)
      setCouponFormOpen(false)
      fetchCoupons()

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save coupon")
    }

  }

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return
    try {
      await API.delete(`/coupons/${id}`, H)
      toast.success("Coupon deleted")
      fetchCoupons()
    } catch {
      toast.error("Failed to delete coupon")
    }
  }

  const handleToggleCoupon = async (coupon) => {
    try {
      await API.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive }, H)
      toast.success(coupon.isActive ? "Coupon deactivated" : "Coupon activated")
      fetchCoupons()
    } catch {
      toast.error("Failed to update coupon")
    }
  }

  /* ── CATEGORY HANDLERS ── */

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true)
      const { data } = await API.get("/categories/all", H)
      setCategories(data)
    } catch {
      toast.error("Failed to load categories")
    } finally {
      setCategoryLoading(false)
    }
  }

  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append("image", file)
    try {
      setCatUploading(true)
      const { data } = await API.post("/upload", fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      })
      setCategoryForm((prev) => ({ ...prev, image: data.image }))
      toast.success("Image uploaded")
    } catch {
      toast.error("Image upload failed")
    } finally {
      setCatUploading(false)
    }
  }

  const handleCategorySubmit = async () => {
    if (!categoryForm.title || !categoryForm.category) {
      toast.error("Title and category key are required")
      return
    }
    try {
      const payload = {
        ...categoryForm,
        order: Number(categoryForm.order) || 0
      }
      if (editingCategory) {
        await API.put(`/categories/${editingCategory._id}`, payload, H)
        toast.success("Category updated")
      } else {
        await API.post("/categories", payload, H)
        toast.success("Category created")
      }
      setCategoryForm({ title:"", category:"", image:"", isVisible:true, order:0 })
      setEditingCategory(null)
      setCategoryFormOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category")
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category? This won't delete products in it.")) return
    try {
      await API.delete(`/categories/${id}`, H)
      toast.success("Category deleted")
      fetchCategories()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const handleToggleCategoryVisibility = async (cat) => {
    try {
      await API.put(`/categories/${cat._id}`, { isVisible: !cat.isVisible }, H)
      toast.success(cat.isVisible ? "Hidden from site" : "Now visible on site")
      fetchCategories()
    } catch {
      toast.error("Failed to update")
    }
  }

  const startEditCategory = (cat) => {
    setEditingCategory(cat)
    setCategoryForm({
      title:     cat.title,
      category:  cat.category,
      image:     cat.image || "",
      isVisible: cat.isVisible,
      order:     cat.order || 0
    })
    setCategoryFormOpen(true)
  }

  /* ── TESTIMONIAL HANDLERS ── */

  const fetchTestimonials = async () => {
    try {
      setTestimonialLoading(true)
      const { data } = await API.get("/testimonials/all", H)
      setTestimonials(data)
    } catch {
      toast.error("Failed to load testimonials")
    } finally {
      setTestimonialLoading(false)
    }
  }

  const handleTestimonialSubmit = async () => {
    if (!testimonialForm.name || !testimonialForm.message) {
      toast.error("Name and message are required")
      return
    }
    try {
      const payload = {
        ...testimonialForm,
        rating: Number(testimonialForm.rating),
        order:  Number(testimonialForm.order) || 0,
      }
      if (editingTestimonial) {
        await API.put(`/testimonials/${editingTestimonial._id}`, payload, H)
        toast.success("Testimonial updated")
      } else {
        await API.post("/testimonials", payload, H)
        toast.success("Testimonial created")
      }
      setTestimonialForm({ name:"", role:"Customer", message:"", rating:5, avatar:"", isVisible:true, order:0 })
      setEditingTestimonial(null)
      setTestimonialFormOpen(false)
      fetchTestimonials()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save testimonial")
    }
  }

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return
    try {
      await API.delete(`/testimonials/${id}`, H)
      toast.success("Testimonial deleted")
      fetchTestimonials()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const handleToggleTestimonialVisibility = async (t) => {
    try {
      await API.put(`/testimonials/${t._id}`, { isVisible: !t.isVisible }, H)
      toast.success(t.isVisible ? "Hidden from site" : "Now visible on site")
      fetchTestimonials()
    } catch {
      toast.error("Failed to update visibility")
    }
  }

  const startEditTestimonial = (t) => {
    setEditingTestimonial(t)
    setTestimonialForm({
      name:      t.name,
      role:      t.role,
      message:   t.message,
      rating:    t.rating,
      avatar:    t.avatar || "",
      isVisible: t.isVisible,
      order:     t.order || 0
    })
    setTestimonialFormOpen(true)
  }

  const startEditCoupon = (coupon) => {
    setEditingCoupon(coupon)
    setCouponForm({
      code:           coupon.code,
      discountType:   coupon.discountType,
      discountValue:  coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || "",
      maxDiscount:    coupon.maxDiscount    || "",
      usageLimit:     coupon.usageLimit     || "",
      expiresAt:      coupon.expiresAt ? coupon.expiresAt.slice(0,10) : ""
    })
    setCouponFormOpen(true)
  }

  /* ── FETCH ── */

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get("/admin/dashboard", H)
      setStats(data)
    } catch {
      toast.error("Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/admin/users", H)
      setUsers(data)
    } catch { toast.error("Failed to load users") }
  }

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/admin/orders", H)
      setOrders(data)
    } catch { toast.error("Failed to load orders") }
  }

  const fetchMessages = async () => {
    try {
      const { data } = await API.get("/admin/messages", H)
      setMessages(data)
    } catch { toast.error("Failed to load messages") }
  }

  const fetchAbandoned = async () => {
    try {
      const { data } = await API.get("/admin/abandoned-carts", H)
      setAbandoned(data)
    } catch { toast.error("Failed to load abandoned carts") }
  }

  useEffect(() => { fetchDashboard() }, [])

  useEffect(() => {
    if (activeTab === "users")     fetchUsers()
    if (activeTab === "orders")    fetchOrders()
    if (activeTab === "messages")  fetchMessages()
    if (activeTab === "abandoned") fetchAbandoned()
    if (activeTab === "analytics") fetchAnalytics()
    if (activeTab === "coupons")   fetchCoupons()
    if (activeTab === "testimonials") fetchTestimonials()
    if (activeTab === "categories")   fetchCategories()
  }, [activeTab])

  /* ── ACTIONS ── */

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { orderStatus:status }, H)
      toast.success("Status updated")
      fetchOrders()
    } catch { toast.error("Failed to update status") }
  }

  const updateRole = async (userId, role) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role }, H)
      toast.success("Role updated")
      fetchUsers()
    } catch { toast.error("Failed to update role") }
  }

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return
    try {
      await API.delete(`/admin/users/${userId}`, H)
      toast.success("User deleted")
      fetchUsers()
    } catch { toast.error("Failed to delete user") }
  }

  const markRead = async (msg) => {
    if (!msg.isRead) {
      try {
        await API.put(`/admin/messages/${msg._id}/read`, {}, H)
        fetchMessages()
        fetchDashboard()
      } catch {}
    }
    setOpenMessage(msg)
  }

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return
    try {
      await API.delete(`/admin/messages/${id}`, H)
      toast.success("Message deleted")
      if (openMessage?._id === id) setOpenMessage(null)
      fetchMessages()
    } catch { toast.error("Failed to delete message") }
  }

  /* ── TABS CONFIG (role-gated) ── */

  const allTabs = [
    { id:"dashboard", label:"DASHBOARD",       roles:[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF] },
    { id:"products",  label:"PRODUCTS",         roles:[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF] },
    { id:"orders",    label:"ORDERS",           roles:[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF] },
    { id:"abandoned", label:"ABANDONED CARTS",  roles:[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF] },
    { id:"messages",  label:"MESSAGES",         roles:[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF] },
    { id:"users",     label:"USERS",            roles:[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.STAFF] },
    { id:"coupons",   label:"COUPONS",          roles:[ROLES.SUPERADMIN] },
    { id:"analytics",    label:"ANALYTICS",        roles:[ROLES.SUPERADMIN] },
    { id:"testimonials", label:"TESTIMONIALS",     roles:[ROLES.SUPERADMIN] },
    { id:"categories",   label:"CATEGORIES",        roles:[ROLES.SUPERADMIN] },
  ]

  const visibleTabs =
    allTabs.filter((t) => t.roles.includes(role))

  /* ── UNREAD COUNT ── */

  const unread =
    messages.filter((m) => !m.isRead).length ||
    stats?.unreadMessages || 0

  return (
    <section className="admin-page">

      {/* SIDEBAR */}

      <div className="admin-sidebar">

        <h2>SARMAN ADMIN</h2>

        <ul>
          {visibleTabs.map((tab) => (
            <li
              key={tab.id}
              className={activeTab === tab.id ? "active-tab" : ""}
              onClick={() => {
                if (tab.id === "products") {
                  navigate("/admin-products")
                } else {
                  setActiveTab(tab.id)
                }
              }}
            >
              {tab.label}
              {tab.id === "messages" && unread > 0 && (
                <span className="unread-dot">{unread}</span>
              )}
              {tab.id === "abandoned" && stats?.abandonedCarts > 0 && (
                <span className="unread-dot">{stats.abandonedCarts}</span>
              )}
            </li>
          ))}
        </ul>

        <div className="admin-user-info">
          <p className="admin-role-badge">{role?.toUpperCase()}</p>
          <p className="admin-username">{user?.name}</p>
        </div>

      </div>

      {/* CONTENT */}

      <div className="admin-content">

        {/* ════ DASHBOARD ════ */}

        {activeTab === "dashboard" && (
          <>
            <div className="admin-title">
              <span>SARMAN LUXURY</span>
              <h1>DASHBOARD</h1>
            </div>

            {loading ? (
              <div className="admin-spinner">Loading...</div>
            ) : (
              <>
                <div className="admin-stats">

                  <div className="admin-card">
                    <h3>TOTAL USERS</h3>
                    <h2>{stats?.totalUsers || 0}</h2>
                  </div>

                  <div className="admin-card">
                    <h3>TOTAL PRODUCTS</h3>
                    <h2>{stats?.totalProducts || 0}</h2>
                  </div>

                  <div className="admin-card">
                    <h3>TOTAL ORDERS</h3>
                    <h2>{stats?.totalOrders || 0}</h2>
                  </div>

                  <div className="admin-card">
                    <h3>TOTAL REVENUE</h3>
                    <h2>₹{stats?.totalRevenue?.toLocaleString() || 0}</h2>
                  </div>

                  <div className="admin-card admin-card-alert">
                    <h3>UNREAD MESSAGES</h3>
                    <h2>{stats?.unreadMessages || 0}</h2>
                  </div>

                  <div className="admin-card admin-card-warn">
                    <h3>ABANDONED CARTS</h3>
                    <h2>{stats?.abandonedCarts || 0}</h2>
                  </div>

                </div>

                <div className="recent-orders">
                  <h2>RECENT ORDERS</h2>

                  {!stats?.recentOrders?.length ? (
                    <p className="no-data">No orders yet.</p>
                  ) : (
                    <>
                      <div className="orders-table-header">
                        <span>CUSTOMER</span>
                        <span>AMOUNT</span>
                        <span>STATUS</span>
                        <span>DATE</span>
                      </div>
                      <div className="orders-table">
                        {stats.recentOrders.map((order) => (
                          <div className="order-row" key={order._id}>
                            <div>{order.user?.name || "—"}</div>
                            <div>₹{order.totalPrice?.toLocaleString()}</div>
                            <div>
                              <span className={`status-badge status-${order.orderStatus?.toLowerCase()}`}>
                                {order.orderStatus}
                              </span>
                            </div>
                            <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ════ ORDERS ════ */}

        {activeTab === "orders" && (
          <>
            <div className="admin-title">
              <span>SARMAN LUXURY</span>
              <h1>ALL ORDERS</h1>
            </div>

            {!orders.length ? (
              <p className="no-data">No orders found.</p>
            ) : (
              <div className="admin-orders-list">
                {orders.map((order) => (
                  <div className="admin-order-card" key={order._id}>

                    <div className="admin-order-header">
                      <div>
                        <p className="order-customer">{order.user?.name || "—"}</p>
                        <p className="order-email">{order.user?.email || "—"}</p>
                        {order.shippingAddress?.phone && (
                          <p className="order-email">📞 {order.shippingAddress.phone}</p>
                        )}
                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="order-meta">
                        <p className="order-total">₹{order.totalPrice?.toLocaleString()}</p>
                        <p className="order-payment">{order.paymentMethod}</p>
                      </div>
                    </div>

                    <div className="admin-order-items">
                      {order.orderItems?.map((item, i) => (
                        <div className="admin-order-item" key={i}>
                          <img src={item.product?.images?.[0] || ""} alt={item.product?.name} />
                          <span>{item.product?.name}</span>
                          <span>× {item.quantity}</span>
                          <span>₹{item.product?.price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="admin-order-footer">
                      <span className={`status-badge status-${order.orderStatus?.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>

                      {canDo(role, "updateOrderStatus") && (
                        <select
                          className="status-select"
                          value={order.orderStatus}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                        >
                          {["Processing","Shipped","Delivered","Cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════ ABANDONED CARTS ════ */}

        {activeTab === "abandoned" && (
          <>
            <div className="admin-title">
              <span>SARMAN LUXURY</span>
              <h1>ABANDONED CARTS</h1>
            </div>

            <p className="section-desc">
              Customers who have items in their cart but haven't placed an order in the last 24 hours.
            </p>

            {!abandoned.length ? (
              <p className="no-data">No abandoned carts found. 🎉</p>
            ) : (
              <div className="abandoned-list">
                {abandoned.map((cart) => (
                  <div className="abandoned-card" key={cart._id}>

                    <div className="abandoned-header">
                      <div>
                        <p className="abandoned-name">{cart.user?.name || "Unknown"}</p>
                        <p className="abandoned-email">{cart.user?.email || "—"}</p>
                      </div>
                      <div className="abandoned-meta">
                        <p className="abandoned-count">
                          {cart.items?.length} item{cart.items?.length !== 1 ? "s" : ""}
                        </p>
                        <p className="abandoned-total">
                          ₹{cart.items?.reduce(
                            (acc, item) =>
                              acc + (item.product?.price || 0) * item.quantity,
                            0
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="abandoned-items">
                      {cart.items?.map((item, i) => (
                        <div className="abandoned-item" key={i}>
                          <img
                            src={item.product?.images?.[0] || ""}
                            alt={item.product?.name}
                          />
                          <div>
                            <p>{item.product?.name}</p>
                            <p className="abandoned-item-price">
                              ₹{item.product?.price?.toLocaleString()} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════ CONTACT MESSAGES ════ */}

        {activeTab === "messages" && (
          <>
            <div className="admin-title">
              <span>SARMAN LUXURY</span>
              <h1>CONTACT MESSAGES</h1>
            </div>

            {!messages.length ? (
              <p className="no-data">No messages yet.</p>
            ) : (
              <div className="messages-layout">

                {/* LIST */}

                <div className="messages-list">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message-row ${openMessage?._id === msg._id ? "active" : ""} ${!msg.isRead ? "unread" : ""}`}
                      onClick={() => markRead(msg)}
                    >
                      <div className="message-row-top">
                        <span className="msg-name">{msg.name}</span>
                        <span className="msg-date">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="msg-subject">{msg.subject}</p>
                      <p className="msg-preview">
                        {msg.message.slice(0, 60)}...
                      </p>
                      {!msg.isRead && <span className="unread-indicator" />}
                    </div>
                  ))}
                </div>

                {/* DETAIL */}

                <div className="message-detail">
                  {!openMessage ? (
                    <div className="message-empty">
                      <p>Select a message to read</p>
                    </div>
                  ) : (
                    <>
                      <div className="message-detail-header">
                        <div>
                          <h3>{openMessage.subject}</h3>
                          <p className="msg-from">
                            {openMessage.name} &lt;{openMessage.email}&gt;
                          </p>
                          <p className="msg-time">
                            {new Date(openMessage.createdAt).toLocaleString()}
                          </p>
                        </div>

                        {canDo(role, "deleteMessage") && (
                          <button
                            className="delete-msg-btn"
                            onClick={() => deleteMessage(openMessage._id)}
                          >
                            DELETE
                          </button>
                        )}
                      </div>

                      <div className="message-body">
                        {openMessage.message}
                      </div>

                      <a
                        className="reply-link"
                        href={`mailto:${openMessage.email}?subject=Re: ${openMessage.subject}`}
                      >
                        REPLY VIA EMAIL →
                      </a>
                    </>
                  )}
                </div>

              </div>
            )}
          </>
        )}

        {/* ════ USERS ════ */}

        {activeTab === "users" && (
          <>
            <div className="admin-title">
              <span>SARMAN LUXURY</span>
              <h1>MANAGE USERS</h1>
            </div>

            {!users.length ? (
              <p className="no-data">No users found.</p>
            ) : (
              <div className="admin-users-list">
                {users.filter((u) => u.role !== "superadmin").map((u) => (
                  <div className="admin-user-row" key={u._id}>

                    <div className="user-info">
                      <p className="user-name">{u.name}</p>
                      <p className="user-email">{u.email}</p>
                      <p className="user-date">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="user-actions">

                      {canDo(role, "changeUserRole") ? (
                        <select
                          className="role-select"
                          value={u.role}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                          disabled={u.role === ROLES.SUPERADMIN}
                        >
                          {(role === ROLES.SUPERADMIN
                            ? ["user","staff","admin","superadmin"]
                            : ["user","staff","admin"]
                          ).map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="role-badge-static">{u.role}</span>
                      )}

                      {canDo(role, "deleteUser") && (
                        <button
                          className="delete-user-btn"
                          onClick={() => deleteUser(u._id)}
                          disabled={u.role === ROLES.SUPERADMIN}
                        >
                          DELETE
                        </button>
                      )}

                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}


        {/* ════ ANALYTICS ════ */}

        {activeTab === "coupons" && canDo(role,"manageCoupons") && (
          <>
            <div className="admin-title">
              <span>SARMAN LUXURY</span>
              <h1>COUPONS</h1>
            </div>

            {/* CREATE BUTTON */}
            <div className="coupon-admin-topbar">
              <button
                className="coupon-admin-new-btn"
                onClick={() => {
                  setEditingCoupon(null)
                  setCouponForm({ code:"", discountType:"percentage", discountValue:"", minOrderAmount:"", maxDiscount:"", usageLimit:"", expiresAt:"" })
                  setCouponFormOpen(true)
                }}
              >
                + NEW COUPON
              </button>
            </div>

            {/* FORM MODAL */}
            {couponFormOpen && (
              <div className="coupon-modal-overlay" onClick={(e) => { if (e.target.classList.contains("coupon-modal-overlay")) setCouponFormOpen(false) }}>
                <div className="coupon-modal">

                  <h2 className="coupon-modal-title">
                    {editingCoupon ? "EDIT COUPON" : "NEW COUPON"}
                  </h2>

                  <div className="coupon-modal-grid">

                    <div className="coupon-field coupon-field-full">
                      <label>COUPON CODE *</label>
                      <input
                        type="text"
                        placeholder="e.g. SARMAN20"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                      />
                    </div>

                    <div className="coupon-field">
                      <label>DISCOUNT TYPE *</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value})}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat (₹)</option>
                      </select>
                    </div>

                    <div className="coupon-field">
                      <label>
                        DISCOUNT VALUE *
                        {couponForm.discountType === "percentage" ? " (%)" : " (₹)"}
                      </label>
                      <input
                        type="number"
                        placeholder={couponForm.discountType === "percentage" ? "e.g. 20" : "e.g. 200"}
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({...couponForm, discountValue: e.target.value})}
                      />
                    </div>

                    <div className="coupon-field">
                      <label>MIN ORDER AMOUNT (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1000"
                        value={couponForm.minOrderAmount}
                        onChange={(e) => setCouponForm({...couponForm, minOrderAmount: e.target.value})}
                      />
                    </div>

                    {couponForm.discountType === "percentage" && (
                      <div className="coupon-field">
                        <label>MAX DISCOUNT CAP (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          value={couponForm.maxDiscount}
                          onChange={(e) => setCouponForm({...couponForm, maxDiscount: e.target.value})}
                        />
                      </div>
                    )}

                    <div className="coupon-field">
                      <label>USAGE LIMIT</label>
                      <input
                        type="number"
                        placeholder="Leave blank = unlimited"
                        value={couponForm.usageLimit}
                        onChange={(e) => setCouponForm({...couponForm, usageLimit: e.target.value})}
                      />
                    </div>

                    <div className="coupon-field">
                      <label>EXPIRY DATE</label>
                      <input
                        type="date"
                        value={couponForm.expiresAt}
                        onChange={(e) => setCouponForm({...couponForm, expiresAt: e.target.value})}
                      />
                    </div>

                  </div>

                  <div className="coupon-modal-actions">
                    <button className="coupon-save-btn" onClick={handleCouponSubmit}>
                      {editingCoupon ? "UPDATE COUPON" : "CREATE COUPON"}
                    </button>
                    <button className="coupon-cancel-btn" onClick={() => setCouponFormOpen(false)}>
                      CANCEL
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* COUPONS TABLE */}
            {couponLoading ? (
              <div className="admin-spinner">Loading coupons...</div>
            ) : coupons.length === 0 ? (
              <p className="no-data">No coupons yet. Create one above.</p>
            ) : (
              <div className="coupon-table-wrap">
                <table className="coupon-table">
                  <thead>
                    <tr>
                      <th>CODE</th>
                      <th>TYPE</th>
                      <th>VALUE</th>
                      <th>MIN ORDER</th>
                      <th>MAX CAP</th>
                      <th>USED / LIMIT</th>
                      <th>EXPIRES</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => {

                      const isExpired = c.expiresAt && new Date() > new Date(c.expiresAt)
                      const usedOut   = c.usageLimit && c.usedCount >= c.usageLimit

                      return (
                        <tr key={c._id}>

                          <td>
                            <span className="coupon-code-cell">{c.code}</span>
                          </td>

                          <td>
                            <span className={`coupon-type-badge coupon-type-${c.discountType}`}>
                              {c.discountType === "percentage" ? "%" : "₹"} FLAT
                            </span>
                          </td>

                          <td className="coupon-value-cell">
                            {c.discountType === "percentage"
                              ? `${c.discountValue}%`
                              : `₹${c.discountValue}`
                            }
                          </td>

                          <td>{c.minOrderAmount ? `₹${c.minOrderAmount}` : "—"}</td>

                          <td>{c.maxDiscount ? `₹${c.maxDiscount}` : "—"}</td>

                          <td>
                            <div className="coupon-usage-bar">
                              <span>{c.usedCount} / {c.usageLimit ?? "∞"}</span>
                              {c.usageLimit && (
                                <div className="coupon-usage-track">
                                  <div
                                    className="coupon-usage-fill"
                                    style={{ width: Math.min(100, (c.usedCount / c.usageLimit) * 100) + "%" }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          <td>
                            {c.expiresAt
                              ? <span style={{ color: isExpired ? "#f87171" : "#aaa" }}>
                                  {new Date(c.expiresAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}
                                  {isExpired && " (Expired)"}
                                </span>
                              : <span style={{color:"#555"}}>No expiry</span>
                            }
                          </td>

                          <td>
                            <button
                              className={`coupon-status-toggle ${c.isActive && !isExpired && !usedOut ? "active" : "inactive"}`}
                              onClick={() => handleToggleCoupon(c)}
                              title="Toggle active/inactive"
                            >
                              {c.isActive && !isExpired && !usedOut ? "ACTIVE" : "INACTIVE"}
                            </button>
                          </td>

                          <td>
                            <div className="coupon-action-btns">
                              <button className="coupon-edit-btn"   onClick={() => startEditCoupon(c)}>EDIT</button>
                              <button className="coupon-delete-btn" onClick={() => handleDeleteCoupon(c._id)}>DELETE</button>
                            </div>
                          </td>

                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "analytics" && (
          <>
            <div className="admin-title">
              <span>SARMAN LUXURY</span>
              <h1>ANALYTICS</h1>
            </div>

            {analyticsLoading || !analytics ? (
              <div className="admin-spinner">Loading analytics...</div>
            ) : (
              <div className="analytics-wrap">

                {/* ── KPI CARDS ── */}

                <div className="analytics-kpis">

                  <div className="kpi-card">
                    <p>TOTAL REVENUE</p>
                    <h2>₹{analytics.revenue.total?.toLocaleString()}</h2>
                    <span>All time</span>
                  </div>

                  <div className="kpi-card">
                    <p>TODAY</p>
                    <h2>₹{analytics.revenue.today?.toLocaleString()}</h2>
                    <span>Revenue today</span>
                  </div>

                  <div className="kpi-card">
                    <p>LAST 7 DAYS</p>
                    <h2>₹{analytics.revenue.last7?.toLocaleString()}</h2>
                    <span>Revenue</span>
                  </div>

                  <div className="kpi-card">
                    <p>LAST 30 DAYS</p>
                    <h2>₹{analytics.revenue.last30?.toLocaleString()}</h2>
                    <span>Revenue</span>
                  </div>

                  <div className="kpi-card">
                    <p>AVG ORDER VALUE</p>
                    <h2>₹{Math.round(analytics.orders.avgValue)?.toLocaleString()}</h2>
                    <span>Per order</span>
                  </div>

                  <div className="kpi-card">
                    <p>NEW USERS (30D)</p>
                    <h2>{analytics.users.last30}</h2>
                    <span>+{analytics.users.today} today</span>
                  </div>

                </div>

                {/* ── REVENUE LAST 30 DAYS — CSS BARS ── */}

                <div className="analytics-chart-box analytics-wide">
                  <h3>REVENUE — LAST 30 DAYS</h3>
                  <CssBarChart
                    data={analytics.orders.byDay}
                    valueKey="revenue"
                    labelKey="_id"
                    color="#c8a45d"
                    formatValue={(v) => "₹"+v.toLocaleString()}
                    formatLabel={(v) => v.slice(5)}
                  />
                </div>

                {/* ── MONTHLY REVENUE — CSS BARS ── */}

                <div className="analytics-chart-box analytics-wide">
                  <h3>MONTHLY REVENUE — LAST 12 MONTHS</h3>
                  <CssBarChart
                    data={analytics.orders.byMonth}
                    valueKey="revenue"
                    labelKey="_id"
                    color="#c8a45d"
                    formatValue={(v) => "₹"+v.toLocaleString()}
                  />
                </div>

                {/* ── BREAKDOWN ROW ── */}

                <div className="analytics-row">

                  {/* ORDER STATUS */}

                  <div className="analytics-chart-box">
                    <h3>ORDERS BY STATUS</h3>
                    <CssDonutList
                      data={analytics.orders.byStatus}
                      valueKey="count"
                      labelKey="_id"
                      colors={["#c8a45d","#4a8ee0","#3dc460","#e05050"]}
                    />
                  </div>

                  {/* SALES BY CATEGORY */}

                  <div className="analytics-chart-box">
                    <h3>SALES BY CATEGORY</h3>
                    <CssDonutList
                      data={analytics.products.byCategory}
                      valueKey="revenue"
                      labelKey="_id"
                      colors={["#c8a45d","#4a8ee0","#3dc460","#e05050","#e07830","#9b59b6"]}
                      formatValue={(v) => "₹"+v.toLocaleString()}
                    />
                  </div>

                  {/* PAYMENT METHODS */}

                  <div className="analytics-chart-box">
                    <h3>PAYMENT METHODS</h3>
                    <CssDonutList
                      data={analytics.payments}
                      valueKey="count"
                      labelKey="_id"
                      colors={["#c8a45d","#3dc460","#4a8ee0"]}
                    />
                  </div>

                </div>

                {/* ── USER GROWTH ── */}

                <div className="analytics-chart-box analytics-wide">
                  <h3>NEW USERS — LAST 30 DAYS</h3>
                  <CssBarChart
                    data={analytics.users.byDay}
                    valueKey="count"
                    labelKey="_id"
                    color="#4a8ee0"
                    formatLabel={(v) => v.slice(5)}
                  />
                </div>

                {/* ── BOTTOM ROW ── */}

                <div className="analytics-row">

                  {/* TOP PRODUCTS */}

                  <div className="analytics-chart-box analytics-list-box">
                    <h3>TOP 5 PRODUCTS</h3>
                    <div className="analytics-list">
                      {analytics.products.top.map((p, i) => (
                        <div className="analytics-list-row" key={i}>
                          <span className="analytics-rank">#{i+1}</span>
                          <img src={p.image} alt={p.name} className="analytics-product-img" />
                          <div className="analytics-list-info">
                            <p>{p.name}</p>
                            <small>{p.category}</small>
                          </div>
                          <div className="analytics-list-stats">
                            <span className="analytics-sold">{p.totalSold} sold</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TOP CITIES */}

                  <div className="analytics-chart-box analytics-list-box">
                    <h3>TOP CITIES</h3>
                    <div className="analytics-list">
                      {analytics.topCities.map((c, i) => (
                        <div className="analytics-list-row" key={i}>
                          <span className="analytics-rank">#{i+1}</span>
                          <div className="analytics-list-info">
                            <p>{c._id || "Unknown"}</p>
                            <small>{c.orders} orders</small>
                          </div>
                          <div className="analytics-list-stats">
                            <span className="analytics-revenue">₹{c.revenue?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION BREAKDOWN */}

                  <div className="analytics-chart-box">
                    <h3>REVENUE BY SECTION</h3>
                    <CssHBarChart
                      data={analytics.products.bySection}
                      valueKey="revenue"
                      labelKey="_id"
                      color="#c8a45d"
                      formatValue={(v) => "₹"+v.toLocaleString()}
                    />
                  </div>

                </div>

              </div>
            )}
          </>
        )}

        {/* ════ TESTIMONIALS ════ */}

        {activeTab === "testimonials" && role === ROLES.SUPERADMIN && (
          <>
            <div className="admin-title">
              <span>SARMAN LUXURY</span>
              <h1>TESTIMONIALS</h1>
            </div>

            <div className="coupon-admin-topbar">
              <button
                className="coupon-admin-new-btn"
                onClick={() => {
                  setEditingTestimonial(null)
                  setTestimonialForm({ name:"", role:"Customer", message:"", rating:5, avatar:"", isVisible:true, order:0 })
                  setTestimonialFormOpen(true)
                }}
              >
                + NEW TESTIMONIAL
              </button>
            </div>

            {testimonialFormOpen && (
              <div
                className="coupon-modal-overlay"
                onClick={(e) => { if (e.target.classList.contains("coupon-modal-overlay")) setTestimonialFormOpen(false) }}
              >
                <div className="coupon-modal">
                  <h2 className="coupon-modal-title">
                    {editingTestimonial ? "EDIT TESTIMONIAL" : "NEW TESTIMONIAL"}
                  </h2>

                  <div className="coupon-modal-grid">

                    <div className="coupon-field">
                      <label>CUSTOMER NAME *</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={testimonialForm.name}
                        onChange={(e) => setTestimonialForm({...testimonialForm, name: e.target.value})}
                      />
                    </div>

                    <div className="coupon-field">
                      <label>ROLE / TITLE</label>
                      <input
                        type="text"
                        placeholder="e.g. Verified Customer"
                        value={testimonialForm.role}
                        onChange={(e) => setTestimonialForm({...testimonialForm, role: e.target.value})}
                      />
                    </div>

                    <div className="coupon-field coupon-field-full">
                      <label>MESSAGE *</label>
                      <textarea
                        rows={4}
                        placeholder="What did they say about Sarman Luxury?"
                        value={testimonialForm.message}
                        onChange={(e) => setTestimonialForm({...testimonialForm, message: e.target.value})}
                        style={{ resize:"vertical", fontFamily:"inherit" }}
                      />
                    </div>

                    <div className="coupon-field">
                      <label>RATING (1–5)</label>
                      <select
                        value={testimonialForm.rating}
                        onChange={(e) => setTestimonialForm({...testimonialForm, rating: Number(e.target.value)})}
                      >
                        {[5,4,3,2,1].map((r) => (
                          <option key={r} value={r}>{"★".repeat(r)} ({r})</option>
                        ))}
                      </select>
                    </div>

                    <div className="coupon-field">
                      <label>AVATAR URL (optional)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={testimonialForm.avatar}
                        onChange={(e) => setTestimonialForm({...testimonialForm, avatar: e.target.value})}
                      />
                    </div>

                    <div className="coupon-field">
                      <label>DISPLAY ORDER (lower = first)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={testimonialForm.order}
                        onChange={(e) => setTestimonialForm({...testimonialForm, order: e.target.value})}
                      />
                    </div>

                    <div className="coupon-field" style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <label style={{ margin:0 }}>VISIBLE ON SITE</label>
                      <input
                        type="checkbox"
                        checked={testimonialForm.isVisible}
                        onChange={(e) => setTestimonialForm({...testimonialForm, isVisible: e.target.checked})}
                        style={{ width:"16px", height:"16px", accentColor:"#c8a45d" }}
                      />
                    </div>

                  </div>

                  <div className="coupon-modal-actions">
                    <button className="coupon-save-btn" onClick={handleTestimonialSubmit}>
                      {editingTestimonial ? "UPDATE" : "CREATE"}
                    </button>
                    <button className="coupon-cancel-btn" onClick={() => setTestimonialFormOpen(false)}>
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {testimonialLoading ? (
              <div className="admin-spinner">Loading testimonials...</div>
            ) : testimonials.length === 0 ? (
              <p className="no-data">No testimonials yet. Add one above.</p>
            ) : (
              <div className="admin-users-list">
                {testimonials.map((t) => (
                  <div className="admin-user-row" key={t._id}>

                    <div className="user-info" style={{ flex:1 }}>
                      <p className="user-name" style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        {t.name}
                        <span style={{ color:"#c8a45d", fontSize:"0.8rem" }}>
                          {"★".repeat(t.rating)}
                        </span>
                        {!t.isVisible && (
                          <span style={{ fontSize:"0.65rem", color:"#888", border:"1px solid #333", padding:"2px 6px", borderRadius:"2px" }}>
                            HIDDEN
                          </span>
                        )}
                      </p>
                      <p className="user-email">{t.role}</p>
                      <p className="user-date" style={{ fontStyle:"italic", color:"#aaa", maxWidth:"480px" }}>
                        "{t.message.length > 100 ? t.message.slice(0,100)+"..." : t.message}"
                      </p>
                    </div>

                    <div className="user-actions">
                      <button
                        onClick={() => handleToggleTestimonialVisibility(t)}
                        style={{
                          background: t.isVisible ? "#c8a45d22" : "#222",
                          color: t.isVisible ? "#c8a45d" : "#666",
                          border: "1px solid currentColor",
                          padding:"6px 12px", fontSize:"0.65rem",
                          letterSpacing:"1px", cursor:"pointer"
                        }}
                      >
                        {t.isVisible ? "VISIBLE" : "HIDDEN"}
                      </button>
                      <button className="coupon-edit-btn"   onClick={() => startEditTestimonial(t)}>EDIT</button>
                      <button className="coupon-delete-btn" onClick={() => handleDeleteTestimonial(t._id)}>DELETE</button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}


        {/* ════ CATEGORIES ════ */}

        {activeTab === "categories" && role === ROLES.SUPERADMIN && (
          <>
            <div className="admin-title">
              <span>SARMAN LUXURY</span>
              <h1>CATEGORIES</h1>
            </div>

            <div className="coupon-admin-topbar">
              <button
                className="coupon-admin-new-btn"
                onClick={() => {
                  setEditingCategory(null)
                  setCategoryForm({ title:"", category:"", image:"", isVisible:true, order:0 })
                  setCategoryFormOpen(true)
                }}
              >
                + NEW CATEGORY
              </button>
            </div>

            {categoryFormOpen && (
              <div
                className="coupon-modal-overlay"
                onClick={(e) => { if (e.target.classList.contains("coupon-modal-overlay")) setCategoryFormOpen(false) }}
              >
                <div className="coupon-modal">
                  <h2 className="coupon-modal-title">
                    {editingCategory ? "EDIT CATEGORY" : "NEW CATEGORY"}
                  </h2>

                  <div className="coupon-modal-grid">

                    <div className="coupon-field">
                      <label>DISPLAY TITLE *</label>
                      <input
                        type="text"
                        placeholder="e.g. Luxury Watches"
                        value={categoryForm.title}
                        onChange={(e) => setCategoryForm({...categoryForm, title: e.target.value})}
                      />
                    </div>

                    <div className="coupon-field">
                      <label>CATEGORY KEY * (used in products & filters)</label>
                      <input
                        type="text"
                        placeholder="e.g. Watches"
                        value={categoryForm.category}
                        disabled={!!editingCategory}
                        onChange={(e) => setCategoryForm({...categoryForm, category: e.target.value})}
                        style={{ opacity: editingCategory ? 0.5 : 1 }}
                      />
                      {!editingCategory && (
                        <small style={{ color:"#888", fontSize:"0.68rem" }}>
                          Cannot be changed after creation. Must match product categories exactly.
                        </small>
                      )}
                    </div>

                    <div className="coupon-field coupon-field-full">
                      <label>CATEGORY IMAGE</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryImageUpload}
                        style={{ color:"#ccc" }}
                      />
                      {catUploading && (
                        <small style={{ color:"#c8a45d" }}>Uploading...</small>
                      )}
                      {categoryForm.image && (
                        <img
                          src={categoryForm.image}
                          alt="preview"
                          style={{ width:"120px", height:"80px", objectFit:"cover", marginTop:"10px", border:"1px solid #333" }}
                        />
                      )}
                    </div>

                    <div className="coupon-field">
                      <label>DISPLAY ORDER (lower = first)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={categoryForm.order}
                        onChange={(e) => setCategoryForm({...categoryForm, order: e.target.value})}
                      />
                    </div>

                    <div className="coupon-field" style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <label style={{ margin:0 }}>VISIBLE ON SITE</label>
                      <input
                        type="checkbox"
                        checked={categoryForm.isVisible}
                        onChange={(e) => setCategoryForm({...categoryForm, isVisible: e.target.checked})}
                        style={{ width:"16px", height:"16px", accentColor:"#c8a45d" }}
                      />
                    </div>

                  </div>

                  <div className="coupon-modal-actions">
                    <button className="coupon-save-btn" onClick={handleCategorySubmit} disabled={catUploading}>
                      {editingCategory ? "UPDATE" : "CREATE"}
                    </button>
                    <button className="coupon-cancel-btn" onClick={() => setCategoryFormOpen(false)}>
                      CANCEL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {categoryLoading ? (
              <div className="admin-spinner">Loading categories...</div>
            ) : categories.length === 0 ? (
              <p className="no-data">No categories yet. Add one above.</p>
            ) : (
              <div className="admin-users-list">
                {categories.map((cat) => (
                  <div className="admin-user-row" key={cat._id}>

                    <div style={{ width:"60px", height:"44px", flexShrink:0 }}>
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.title}
                          style={{ width:"60px", height:"44px", objectFit:"cover", border:"1px solid #222" }}
                        />
                      ) : (
                        <div style={{ width:"60px", height:"44px", background:"#1a1a1a", border:"1px solid #222", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <span style={{ color:"#444", fontSize:"0.65rem" }}>NO IMG</span>
                        </div>
                      )}
                    </div>

                    <div className="user-info" style={{ flex:1 }}>
                      <p className="user-name">{cat.title}</p>
                      <p className="user-email" style={{ color:"#c8a45d" }}>Key: {cat.category}</p>
                      <p className="user-date">Order: {cat.order}</p>
                    </div>

                    <div className="user-actions">
                      <button
                        onClick={() => handleToggleCategoryVisibility(cat)}
                        style={{
                          background: cat.isVisible ? "#c8a45d22" : "#222",
                          color: cat.isVisible ? "#c8a45d" : "#666",
                          border: "1px solid currentColor",
                          padding:"6px 12px", fontSize:"0.65rem",
                          letterSpacing:"1px", cursor:"pointer"
                        }}
                      >
                        {cat.isVisible ? "VISIBLE" : "HIDDEN"}
                      </button>
                      <button className="coupon-edit-btn"   onClick={() => startEditCategory(cat)}>EDIT</button>
                      <button className="coupon-delete-btn" onClick={() => handleDeleteCategory(cat._id)}>DELETE</button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}


      </div>

    </section>
  )

}

export default Admin
