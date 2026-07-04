import "./styles/Checkout.css"
import Navbar from "../components/Navbar/Navbar"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import toast from "react-hot-toast"

/* ── PAYMENT METHOD CONFIG ── */

const PAYMENT_METHODS = [
  {
    id:    "upi",
    label: "UPI",
    sub:   "GPay, PhonePe, Paytm & more",
    icon:  "📲",
    rzpMethod: "upi"
  },
  {
    id:    "card",
    label: "Credit / Debit Card",
    sub:   "Visa, Mastercard, Rupay",
    icon:  "💳",
    rzpMethod: "card"
  },
  {
    id:    "netbanking",
    label: "Net Banking",
    sub:   "All major banks supported",
    icon:  "🏦",
    rzpMethod: "netbanking"
  },
  {
    id:    "wallet",
    label: "Wallet",
    sub:   "Paytm, Amazon Pay, Mobikwik",
    icon:  "👛",
    rzpMethod: "wallet"
  },
  {
    id:    "paylater",
    label: "Pay Later / EMI",
    sub:   "Simpl, LazyPay, ZestMoney",
    icon:  "🕒",
    rzpMethod: "paylater"
  },
  {
    id:    "cod",
    label: "Cash on Delivery",
    sub:   "Pay when your order arrives",
    icon:  "💵",
    rzpMethod: null
  },
]

function Checkout() {

  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { cart, totalPrice, clearCart } = useCart()

  /* STEPS: address | payment */
  const [step, setStep] = useState("address")

  /* FORM */
  const [formData, setFormData] = useState({
    fullName:"", phone:"", city:"",
    state:"", country:"India", pincode:"", address:""
  })

  /* PAYMENT METHOD */
  const [paymentMethod, setPaymentMethod] = useState("upi")

  /* COUPON */
  const [couponInput,   setCouponInput]   = useState("")
  const [couponApplied, setCouponApplied] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  /* LOADING */
  const [loading, setLoading] = useState(false)

  /* COMPUTED */
  const discount   = couponApplied?.discount   || 0
  const finalTotal = couponApplied?.finalTotal  ?? totalPrice
  const shipping   = finalTotal >= 999 ? 0 : 99
  const grandTotal = finalTotal + shipping

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  /* VALIDATE STEP 1 */
  const handleNextStep = (e) => {
    e.preventDefault()
    const required = ["fullName","phone","city","state","country","pincode","address"]
    for (const f of required) {
      if (!formData[f].trim()) {
        toast.error(`Please fill in ${f}`)
        return
      }
    }
    setStep("payment")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* APPLY COUPON */
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) { toast.error("Enter a coupon code"); return }
    try {
      setCouponLoading(true)
      const { data } = await API.post(
        "/coupons/apply",
        { code: couponInput, cartTotal: totalPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCouponApplied(data)
      toast.success(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon")
      setCouponApplied(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponApplied(null)
    setCouponInput("")
  }

  /* LOAD RAZORPAY SCRIPT */
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (document.getElementById("razorpay-script")) { resolve(true); return }
      const s     = document.createElement("script")
      s.id        = "razorpay-script"
      s.src       = "https://checkout.razorpay.com/v1/checkout.js"
      s.onload    = () => resolve(true)
      s.onerror   = () => resolve(false)
      document.body.appendChild(s)
    })

  /* COD ORDER */
  const handleCOD = async () => {
    try {
      setLoading(true)
      await API.post(
        "/orders",
        {
          shippingAddress: formData,
          paymentMethod:   "Cash on Delivery",
          couponCode:      couponApplied?.couponCode || null,
          discountAmount:  discount,
          totalPrice:      grandTotal,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      await clearCart()
      toast.success("Order placed! Pay on delivery.")
      navigate("/orders")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  /* RAZORPAY PAYMENT */
  const handleRazorpay = async (method) => {
    try {
      setLoading(true)

      const loaded = await loadRazorpay()
      if (!loaded) { toast.error("Razorpay failed to load"); return }

      const { data } = await API.post(
        "/payment/create-order",
        { amount: grandTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        "Sarman Luxury",
        description: "Order Payment",
        order_id:    data.orderId,
        prefill: {
          name:    user?.name || formData.fullName,
          email:   user?.email || "",
          contact: formData.phone
        },
        config: {
          display: {
            hide: method
              ? PAYMENT_METHODS
                  .filter(m => m.rzpMethod && m.rzpMethod !== method)
                  .map(m => ({ method: m.rzpMethod }))
              : []
          }
        },
        theme: { color: "#C8A45D" },
        handler: async (response) => {
          try {
            await API.post(
              "/payment/verify",
              {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                shippingAddress:     formData,
                couponCode:          couponApplied?.couponCode || null,
                discountAmount:      discount,
                finalTotal:          grandTotal
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
            await clearCart()
            toast.success("Payment successful! Order placed.")
            navigate("/orders")
          } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed")
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled")
            setLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.")
        setLoading(false)
      })
      rzp.open()

    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong")
      setLoading(false)
    }
  }

  /* PLACE ORDER */
  const handlePlaceOrder = () => {
    if (paymentMethod === "cod") {
      handleCOD()
    } else {
      const selected = PAYMENT_METHODS.find(m => m.id === paymentMethod)
      handleRazorpay(selected?.rzpMethod || null)
    }
  }

  /* SELECTED METHOD */
  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod)

  return (
    <>
      <Navbar />

      <section className="co-page">
        <div className="co-wrap">

          {/* ── PROGRESS BAR ── */}
          <div className="co-progress">
            <div className={`co-step ${step === "address" ? "co-step-active" : "co-step-done"}`}>
              <div className="co-step-circle">
                {step === "address" ? "1" : "✓"}
              </div>
              <span>DELIVERY</span>
            </div>
            <div className="co-step-line" />
            <div className={`co-step ${step === "payment" ? "co-step-active" : ""}`}>
              <div className="co-step-circle">2</div>
              <span>PAYMENT</span>
            </div>
          </div>

          <div className="co-layout">

            {/* ── LEFT PANEL ── */}
            <div className="co-left">

              {/* STEP 1 — ADDRESS */}
              {step === "address" && (
                <div className="co-card">

                  <div className="co-card-header">
                    <h2>DELIVERY ADDRESS</h2>
                  </div>

                  <form className="co-form" onSubmit={handleNextStep}>

                    <div className="co-form-row">
                      <div className="co-field">
                        <label>FULL NAME</label>
                        <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />
                      </div>
                      <div className="co-field">
                        <label>PHONE NUMBER</label>
                        <input name="phone" placeholder="+91 **********" value={formData.phone} onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="co-field co-field-full">
                      <label>FULL ADDRESS</label>
                      <textarea name="address" placeholder="House / Flat no., Street, Area" value={formData.address} onChange={handleChange} required />
                    </div>

                    <div className="co-form-row">
                      <div className="co-field">
                        <label>CITY</label>
                        <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                      </div>
                      <div className="co-field">
                        <label>STATE</label>
                        <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
                      </div>
                    </div>

                    <div className="co-form-row">
                      <div className="co-field">
                        <label>PINCODE</label>
                        <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
                      </div>
                      <div className="co-field">
                        <label>COUNTRY</label>
                        <input name="country" placeholder="India" value={formData.country} onChange={handleChange} required />
                      </div>
                    </div>

                    <button type="submit" className="co-btn-primary">
                      CONTINUE TO PAYMENT →
                    </button>

                  </form>

                </div>
              )}

              {/* STEP 2 — PAYMENT */}
              {step === "payment" && (
                <>

                  {/* DELIVERY ADDRESS SUMMARY */}
                  <div className="co-card co-address-summary">
                    <div className="co-address-summary-left">
                      <p className="co-address-summary-label">DELIVERING TO</p>
                      <p className="co-address-summary-name">{formData.fullName}</p>
                      <p className="co-address-summary-addr">
                        {formData.address}, {formData.city}, {formData.state} — {formData.pincode}
                      </p>
                    </div>
                    <button className="co-change-btn" onClick={() => setStep("address")}>
                      CHANGE
                    </button>
                  </div>

                  {/* PAYMENT METHOD SELECTOR */}
                  <div className="co-card">

                    <div className="co-card-header">
                      <h2>PAYMENT METHOD</h2>
                    </div>

                    <div className="co-methods">
                      {PAYMENT_METHODS.map((m) => (
                        <label
                          key={m.id}
                          className={`co-method ${paymentMethod === m.id ? "co-method-selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={m.id}
                            checked={paymentMethod === m.id}
                            onChange={() => setPaymentMethod(m.id)}
                          />
                          <span className="co-method-icon">{m.icon}</span>
                          <div className="co-method-info">
                            <span className="co-method-label">{m.label}</span>
                            <span className="co-method-sub">{m.sub}</span>
                          </div>
                          {paymentMethod === m.id && (
                            <span className="co-method-check">✓</span>
                          )}
                        </label>
                      ))}
                    </div>

                  </div>

                  {/* PLACE ORDER BTN */}
                  <button
                    className="co-btn-primary co-pay-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="co-btn-loading">
                        <span className="co-spinner" /> PROCESSING...
                      </span>
                    ) : paymentMethod === "cod" ? (
                      `PLACE ORDER — ₹${grandTotal.toLocaleString()} (COD)`
                    ) : (
                      `PAY ₹${grandTotal.toLocaleString()} WITH ${selectedMethod?.label.toUpperCase()}`
                    )}
                  </button>

                  <p className="co-secure-note">
                    🔒 Payments secured by Razorpay · SSL Encrypted
                  </p>

                </>
              )}

            </div>

            {/* ── RIGHT PANEL — ORDER SUMMARY ── */}
            <div className="co-right">

              <div className="co-card co-summary-card">

                <div className="co-card-header">
                  <h2>ORDER SUMMARY</h2>
                  <span className="co-item-count">{cart.length} items</span>
                </div>

                {/* CART ITEMS */}
                <div className="co-cart-items">
                  {cart.map((item, i) => (
                    <div className="co-cart-row" key={i}>
                      <div className="co-cart-img-wrap">
                        {item.product?.images?.[0] && (
                          <img src={item.product.images[0]} alt={item.product?.name} />
                        )}
                        <span className="co-cart-qty">{item.quantity}</span>
                      </div>
                      <div className="co-cart-info">
                        <p className="co-cart-name">{item.product?.name}</p>
                        <p className="co-cart-brand">{item.product?.brand}</p>
                      </div>
                      <p className="co-cart-price">
                        ₹{(item.product?.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* COUPON */}
                <div className="co-coupon">
                  {couponApplied ? (
                    <div className="co-coupon-applied">
                      <div>
                        <span className="co-coupon-code">🏷 {couponApplied.couponCode}</span>
                        <span className="co-coupon-saved">−₹{discount.toLocaleString()} saved</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="co-coupon-remove">✕</button>
                    </div>
                  ) : (
                    <div className="co-coupon-row">
                      <input
                        type="text"
                        placeholder="Coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="co-coupon-btn"
                      >
                        {couponLoading ? "..." : "APPLY"}
                      </button>
                    </div>
                  )}
                </div>

                {/* PRICE BREAKDOWN */}
                <div className="co-breakdown">

                  <div className="co-breakdown-row">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="co-breakdown-row co-breakdown-discount">
                      <span>Coupon discount</span>
                      <span>−₹{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="co-breakdown-row">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "co-free-ship" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <p className="co-ship-hint">
                      Add ₹{(999 - finalTotal).toLocaleString()} more for free shipping
                    </p>
                  )}

                  <div className="co-breakdown-divider" />

                  <div className="co-breakdown-total">
                    <span>TOTAL</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>
    </>
  )
}

export default Checkout
