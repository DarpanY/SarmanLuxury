/**
 * Run once to seed testimonials into MongoDB:
 *   node seedTestimonials.js
 */

require("dotenv").config()
const mongoose = require("mongoose")
const Testimonial = require("./models/Testimonial")

const seeds = [
  {
    name: "Priya Sharma",
    role: "Verified Customer",
    message: "Absolutely stunning quality. Sarman Luxury exceeded every expectation. The craftsmanship is unlike anything I have seen before.",
    rating: 5,
    isVisible: true,
    order: 1
  },
  {
    name: "Arjun Mehta",
    role: "Loyal Customer",
    message: "The attention to detail is unmatched. I get compliments every time I wear it. Will definitely be ordering again.",
    rating: 5,
    isVisible: true,
    order: 2
  },
  {
    name: "Sneha Patel",
    role: "Verified Customer",
    message: "Luxury redefined. Fast delivery, beautifully packaged, and the product looks even better in person.",
    rating: 5,
    isVisible: true,
    order: 3
  },
  {
    name: "Rahul Gupta",
    role: "Premium Member",
    message: "I have shopped from many luxury brands but Sarman Luxury stands apart. The quality is exceptional and the service is impeccable.",
    rating: 5,
    isVisible: true,
    order: 4
  }
]

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB")
    await Testimonial.deleteMany({})
    await Testimonial.insertMany(seeds)
    console.log(`✅ Seeded ${seeds.length} testimonials successfully`)
    process.exit(0)
  })
  .catch((err) => {
    console.error("Error:", err)
    process.exit(1)
  })
