import "./Hero.css"
import {motion} from"framer-motion"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import hero1 from "../../assets/images/hero/hero1.png"
import hero2 from "../../assets/images/hero/hero2.png"
import hero3 from "../../assets/images/hero/hero3.png"
import hero4 from "../../assets/images/hero/hero4.png"

function Hero() {

  const slides = [
    hero1,
    hero2,
    hero3,
    hero4
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {

    const slider = setInterval(() => {

      setCurrentSlide((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      )

    }, 5000)

    return () => clearInterval(slider)

  }, [])

  return (

    <section className="hero">

      {/* SLIDES */}

      {slides.map((slide, index) => (

        <div
          key={index}
          className={
            index === currentSlide
              ? "hero-slide active"
              : "hero-slide"
          }
          style={{
            backgroundImage:`url(${slide})`
          }}
        >

          <div className="hero-overlay"></div>

        </div>

      ))}

      {/* CONTENT */}

      <motion.div className="hero-content"

  initial={{

    opacity:0,

    y:40

  }}

  animate={{

    opacity:1,

    y:0

  }}

  transition={{

    duration:1

  }}
>

        <div className="hero-left">

          <span className="hero-subtitle">
            SARMAN LUXURY
          </span>

          <h1>
            Timeless
            <br />
            Luxury
          </h1>

          <div className="hero-line"></div>

          <p>
            Crafted for those who value
            elegance and perfection.
          </p>

          <button onClick={() => navigate("/collections")}>
            EXPLORE COLLECTION
          </button>

        </div>

      </motion.div>

      {/* DOTS */}

      <div className="hero-dots">

        {slides.map((_, index) => (

          <span
            key={index}
            className={
              currentSlide === index
                ? "dot active-dot"
                : "dot"
            }
            onClick={() => setCurrentSlide(index)}
          ></span>

        ))}

      </div>

      {/* FEATURES */}

      <div className="hero-features">

        <div className="feature-item">

          <h4>AUTHENTIC PRODUCTS</h4>

          <p>100% Genuine Products</p>

        </div>

        <div className="feature-item">

          <h4>SECURE PAYMENT</h4>

          <p>100% Secure Payments</p>

        </div>

        <div className="feature-item">

          <h4>PREMIUM QUALITY</h4>

          <p>Carefully Crafted</p>

        </div>

        <div className="feature-item">

          <h4>WORLDWIDE SHIPPING</h4>

          <p>Fast & Reliable</p>

        </div>

      </div>

    </section>

  )

}

export default Hero