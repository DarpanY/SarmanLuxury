import "./Footer.css"

import { Link } from "react-router-dom"

import logo from "../../assets/images/logo.png"

import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube
} from "react-icons/fi"

function Footer() {

  return (

    <footer className="footer">

      {/* NEWSLETTER */}

      <div className="newsletter">

        <span>
          STAY UPDATED
        </span>

        <h2>
          WITH SARMAN LUXURY
        </h2>

        <p>
          Connect on whatsapp to get special offers,
          luxury drops and premium updates.
        </p>
        

      </div>

      {/* FOOTER CONTENT */}

      <div className="footer-content">

        {/* BRAND */}

        <div className="footer-brand">

          <img
            src={logo}
            alt="Sarman Luxury"
          />

          <p>
            Premium luxury destination
            for watches, fashion and
            timeless elegance.
          </p>

          <div className="footer-socials">

            {/* TODO: replace with your real social profile URLs */}
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FiFacebook />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
              <FiYoutube />
            </a>

          </div>

        </div>

        {/* LINKS */}

        <div className="footer-links">

          <h3>
            SHOP
          </h3>

          <ul>

            <li><Link to="/collections?category=Watches">Watches</Link></li>
            <li><Link to="/collections?category=Shoes">Shoes</Link></li>
            <li><Link to="/collections?category=Bags">Bags</Link></li>
            <li><Link to="/collections?category=Sunglasses">Sunglasses</Link></li>

          </ul>

        </div>

        <div className="footer-links">

          <h3>
            SUPPORT
          </h3>

          <ul>

            <li><Link to="/contact">Contact Us</Link></li>
          </ul>

        </div>

        <div className="footer-links">

          <h3>
            CONTACT
          </h3>

          <ul>

            <li><a href="mailto:support@sarmanluxury.com">support@sarmanluxury.com</a></li>
            <li><a href="tel:+918989488886">+91 89894 88886</a></li>
            <li>Indore, India</li>

          </ul>

        </div>

      </div>

      {/* COPYRIGHT */}

      <div className="footer-bottom">

        <p>
          © 2026 Sarman Luxury.
          All Rights Reserved.
        </p>

      </div>

    </footer>

  )

}

export default Footer