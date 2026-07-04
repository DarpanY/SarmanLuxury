const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },

  image: {
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

module.exports = mongoose.model("Category", categorySchema)
