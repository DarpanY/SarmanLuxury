const mongoose = require("mongoose")

const testimonialSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  role: {
    type: String,
    default: "Customer",
    trim: true
  },

  message: {
    type: String,
    required: true,
    trim: true
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },

  avatar: {
    type: String,
    default: ""
  },

  isVisible: {
    type: Boolean,
    default: true
  },

  order: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
})

module.exports = mongoose.model("Testimonial", testimonialSchema)
