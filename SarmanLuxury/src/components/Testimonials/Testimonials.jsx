import { useEffect, useState } from "react"
import API from "../../api/axios"
import "./Testimonials.css"

function StarRating({ rating }) {
  return (
    <div className="testimonial-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "star filled" : "star"}>★</span>
      ))}
    </div>
  )
}

/* fallback shown until real testimonials are added via admin */
const DEFAULTS = [
  {
    _id: "d1",
    name: "Priya Sharma",
    role: "Verified Customer",
    message: "Absolutely stunning quality. Sarman Luxury exceeded every expectation. The craftsmanship is unlike anything I have seen before.",
    rating: 5,
    avatar: ""
  },
  {
    _id: "d2",
    name: "Arjun Mehta",
    role: "Loyal Customer",
    message: "The attention to detail is unmatched. I get compliments every time I wear it. Will definitely be ordering again.",
    rating: 5,
    avatar: ""
  },
  {
    _id: "d3",
    name: "Sneha Patel",
    role: "Verified Customer",
    message: "Luxury redefined. Fast delivery, beautifully packaged, and the product looks even better in person.",
    rating: 5,
    avatar: ""
  }
]

function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [active, setActive]             = useState(0)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    API.get("/testimonials")
      .then(({ data }) => {
        setTestimonials(data.length ? data : DEFAULTS)
      })
      .catch(() => {
        setTestimonials(DEFAULTS)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  const list = testimonials
  const t    = list[active]

  const prev = () => setActive((a) => (a === 0 ? list.length - 1 : a - 1))
  const next = () => setActive((a) => (a === list.length - 1 ? 0 : a + 1))

  return (
    <section className="testimonials-section">

      <div className="testimonials-header">
        <span className="testimonials-sub">WHAT OUR CLIENTS SAY</span>
        <h2 className="testimonials-title">TESTIMONIALS</h2>
        <div className="testimonials-divider" />
      </div>

      <div className="testimonials-carousel">

        <button className="testimonial-arrow left" onClick={prev}>&#8249;</button>

        <div className="testimonial-card" key={t._id}>

          {t.avatar ? (
            <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
          ) : (
            <div className="testimonial-avatar-placeholder">
              {t.name.charAt(0).toUpperCase()}
            </div>
          )}

          <StarRating rating={t.rating} />

          <p className="testimonial-message">"{t.message}"</p>

          <div className="testimonial-author">
            <p className="testimonial-name">{t.name}</p>
            <p className="testimonial-role">{t.role}</p>
          </div>

        </div>

        <button className="testimonial-arrow right" onClick={next}>&#8250;</button>

      </div>

      <div className="testimonials-dots">
        {list.map((_, i) => (
          <button
            key={i}
            className={`testimonial-dot ${i === active ? "active" : ""}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>

    </section>
  )
}

export default Testimonials
