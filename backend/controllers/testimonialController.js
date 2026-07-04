const Testimonial = require("../models/Testimonial")

/* PUBLIC — get all visible testimonials */

exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial
      .find({ isVisible: true })
      .sort({ order: 1, createdAt: -1 })
    res.status(200).json(testimonials)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/* SUPERADMIN — get ALL testimonials (including hidden) */

exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial
      .find()
      .sort({ order: 1, createdAt: -1 })
    res.status(200).json(testimonials)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/* SUPERADMIN — create testimonial */

exports.createTestimonial = async (req, res) => {
  try {
    const { name, role, message, rating, avatar, isVisible, order } = req.body

    if (!name || !message) {
      return res.status(400).json({ message: "Name and message are required" })
    }

    const testimonial = await Testimonial.create({
      name,
      role: role || "Customer",
      message,
      rating: rating || 5,
      avatar: avatar || "",
      isVisible: isVisible !== undefined ? isVisible : true,
      order: order || 0
    })

    res.status(201).json(testimonial)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/* SUPERADMIN — update testimonial */

exports.updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" })
    }

    res.status(200).json(testimonial)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/* SUPERADMIN — delete testimonial */

exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: "Testimonial deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
