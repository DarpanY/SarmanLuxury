const Coupon =
require("../models/Coupon")

/* ── APPLY COUPON (user) ── */

exports.applyCoupon =
async (req, res) => {

  try {

    const {
      code,
      cartTotal
    } = req.body

    const coupon =
    await Coupon.findOne({
      code:     code.toUpperCase().trim(),
      isActive: true
    })

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon code"
      })
    }

    /* EXPIRED */

    if (
      coupon.expiresAt &&
      new Date() > new Date(coupon.expiresAt)
    ) {
      return res.status(400).json({
        message: "Coupon has expired"
      })
    }

    /* USAGE LIMIT */

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        message: "Coupon usage limit reached"
      })
    }

    /* MIN ORDER */

    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message:
          `Minimum order amount is ₹${coupon.minOrderAmount}`
      })
    }

    /* CALCULATE DISCOUNT */

    let discount = 0

    if (coupon.discountType === "flat") {

      discount = coupon.discountValue

    } else {

      discount = Math.round(
        (cartTotal * coupon.discountValue) / 100
      )

      if (
        coupon.maxDiscount &&
        discount > coupon.maxDiscount
      ) {
        discount = coupon.maxDiscount
      }

    }

    const finalTotal =
    Math.max(0, cartTotal - discount)

    res.status(200).json({

      message:
        coupon.discountType === "flat"
        ? `₹${discount} off applied!`
        : `${coupon.discountValue}% off applied!`,

      discount,
      finalTotal,
      couponCode:    coupon.code,
      discountType:  coupon.discountType,
      discountValue: coupon.discountValue

    })

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

}

/* ── GET ALL COUPONS (admin) ── */

exports.getAllCoupons =
async (req, res) => {

  try {

    const coupons =
    await Coupon.find()
    .sort({ createdAt: -1 })

    res.status(200).json(coupons)

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

}

/* ── CREATE COUPON (admin) ── */

exports.createCoupon =
async (req, res) => {

  try {

    const coupon =
    await Coupon.create(req.body)

    res.status(201).json(coupon)

  }

  catch (error) {

    res.status(400).json({
      message: error.message
    })

  }

}

/* ── UPDATE COUPON (admin) ── */

exports.updateCoupon =
async (req, res) => {

  try {

    const coupon =
    await Coupon.findByIdAndUpdate(

      req.params.id,
      req.body,
      { new: true }

    )

    res.status(200).json(coupon)

  }

  catch (error) {

    res.status(400).json({
      message: error.message
    })

  }

}

/* ── DELETE COUPON (admin) ── */

exports.deleteCoupon =
async (req, res) => {

  try {

    await Coupon.findByIdAndDelete(
      req.params.id
    )

    res.status(200).json({
      message: "Coupon deleted"
    })

  }

  catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

}
