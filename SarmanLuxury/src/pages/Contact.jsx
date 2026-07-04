import "./styles/Contact.css"
import Navbar from "../components/Navbar/Navbar"
import { useState } from "react"
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock
} from "react-icons/fi"
import API from "../api/axios"
import toast from "react-hot-toast"

function Contact() {

  const [formData, setFormData] =
  useState({
    name:"",
    email:"",
    subject:"",
    message:""
  })

  const [sending, setSending] =
  useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:e.target.value
    })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      setSending(true)

      await API.post(
        "/contact",
        formData
      )

      toast.success(
        "Message sent! We'll get back to you soon."
      )

      setFormData({
        name:"",
        email:"",
        subject:"",
        message:""
      })

    }

    catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to send message"
      )

    }

    finally {

      setSending(false)

    }

  }

  return (
    <>
    <Navbar/>
    <section className="contact-page">

      {/* HERO */}

      <div className="contact-hero">

        <div className="contact-overlay"></div>

        <div className="contact-hero-content">

          <span>
            SARMAN LUXURY
          </span>

          <h1>
            CONTACT US
          </h1>

        </div>

      </div>

      {/* CONTACT */}

      <div className="contact-container">

        {/* LEFT */}

        <div className="contact-info">

          <div className="contact-box">
            <div className="contact-icon"><FiMapPin /></div>
            <div>
              <h3>ADDRESS</h3>
              <p>Indore, Madhya Pradesh, India</p>
            </div>
          </div>

          <div className="contact-box">
            <div className="contact-icon"><FiPhone /></div>
            <div>
              <h3>PHONE</h3>
              <p>+91 89894 88886</p>
            </div>
          </div>

          <div className="contact-box">
            <div className="contact-icon"><FiMail /></div>
            <div>
              <h3>EMAIL</h3>
              <p>teamsarmanluxury@gmail.com</p>
            </div>
          </div>

          <div className="contact-box">
            <div className="contact-icon"><FiClock /></div>
            <div>
              <h3>WORKING HOURS</h3>
              <p>Mon - Sat : 10 AM - 8 PM</p>
            </div>
          </div>

        </div>

        {/* RIGHT */}

        <div className="contact-form-box">

          <h2>SEND A MESSAGE</h2>

          <form onSubmit={handleSubmit}>

            <div className="form-row">

              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>

            <button
              type="submit"
              disabled={sending}
            >
              {sending
                ? "SENDING..."
                : "SEND MESSAGE"
              }
            </button>

          </form>

        </div>

      </div>

    </section>
  </>
  )

}

export default Contact
