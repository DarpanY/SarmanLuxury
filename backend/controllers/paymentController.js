const Razorpay =
require("razorpay")

const crypto =
require("crypto")

const Order =
require("../models/Order")

const Cart =
require("../models/Cart")

const Coupon =
require("../models/Coupon")

/* RAZORPAY INSTANCE */

const razorpay =
new Razorpay({

  key_id:
  process.env.RAZORPAY_KEY_ID,

  key_secret:
  process.env.RAZORPAY_KEY_SECRET

})

/* CREATE RAZORPAY ORDER */

exports.createRazorpayOrder =
async (req, res) => {

  try {

    const { amount } = req.body

    const options = {

      amount: amount * 100, // paise

      currency: "INR",

      receipt:
      `receipt_${Date.now()}`

    }

    const razorpayOrder =
    await razorpay.orders.create(options)

    res.status(200).json({

      orderId:   razorpayOrder.id,
      amount:    razorpayOrder.amount,
      currency:  razorpayOrder.currency,
      keyId:     process.env.RAZORPAY_KEY_ID

    })

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

}

/* RESOLVE EXACT PAYMENT METHOD */

const resolveMethod = (p) => {

  if (p.method === "upi")
    return "UPI"

  if (p.method === "wallet")
    return `Wallet (${p.wallet || ""})`

  if (p.method === "netbanking")
    return `Net Banking (${p.bank || ""})`

  if (p.method === "paylater")
    return "Pay Later"

  if (p.method === "emi")
    return "EMI"

  if (p.method === "card") {

    const network = p.card?.network || ""
    const type    = p.card?.type    || ""

    const label = `${network} ${type}`.trim()

    return label
      ? label.charAt(0).toUpperCase() +
        label.slice(1)
      : "Card"

  }

  return p.method || "Razorpay"

}

/* VERIFY PAYMENT & SAVE ORDER */

exports.verifyPayment =
async (req, res) => {

  try {

    const {

      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      couponCode,
      discountAmount,
      finalTotal

    } = req.body

    /* VERIFY SIGNATURE */

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id

    const expectedSignature =
    crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(body.toString())
    .digest("hex")

    if (
      expectedSignature !==
      razorpay_signature
    ) {

      return res.status(400).json({
        message: "Payment verification failed"
      })

    }

    /* FETCH EXACT PAYMENT METHOD FROM RAZORPAY */

    const payment =
    await razorpay.payments.fetch(
      razorpay_payment_id
    )

    const exactMethod =
    resolveMethod(payment)

    /* FIND CART */

    const cart =
    await Cart.findOne({

      user: req.user._id

    }).populate("items.product")

    if (
      !cart ||
      cart.items.length === 0
    ) {

      return res.status(400).json({
        message: "Cart is empty"
      })

    }

    /* TOTAL */

    const totalPrice =
    cart.items.reduce(

      (acc, item) =>
        acc + (
          item.product.price *
          item.quantity
        ),

      0

    )

    /* SAVE ORDER */

    const order =
    await Order.create({

      user:
      req.user._id,

      orderItems:
      cart.items.map((item) => ({

        product:  item.product._id,
        quantity: item.quantity

      })),

      shippingAddress,

      totalPrice:
      finalTotal ?? totalPrice,

      discountAmount:
      discountAmount || 0,

      couponCode:
      couponCode || null,

      paymentMethod:    exactMethod,

      paymentStatus:    "Paid",

      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id

    })

    /* INCREMENT COUPON USAGE */

    if (couponCode) {

      await Coupon.findOneAndUpdate(

        { code: couponCode.toUpperCase() },

        { $inc: { usedCount: 1 } }

      )

    }

    /* CLEAR CART */

    cart.items = []
    await cart.save()

    res.status(201).json({
      message: "Payment successful",
      order
    })

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

}
