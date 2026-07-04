const mongoose =
require("mongoose")

const couponSchema =
new mongoose.Schema({

  code: {

    type:     String,
    required: true,
    unique:   true,
    uppercase: true,
    trim:     true

  },

  discountType: {

    type: String,

    enum: [
      "percentage",
      "flat"
    ],

    default: "percentage"

  },

  discountValue: {

    type:     Number,
    required: true

  },

  minOrderAmount: {

    type:    Number,
    default: 0

  },

  maxDiscount: {

    // cap for percentage coupons
    type:    Number,
    default: null

  },

  usageLimit: {

    // total times can be used
    type:    Number,
    default: null

  },

  usedCount: {

    type:    Number,
    default: 0

  },

  expiresAt: {

    type:    Date,
    default: null

  },

  isActive: {

    type:    Boolean,
    default: true

  }

}, {

  timestamps: true

})

module.exports =
mongoose.model(
  "Coupon",
  couponSchema
)
