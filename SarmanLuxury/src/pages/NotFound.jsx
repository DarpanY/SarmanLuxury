import "./styles/NotFound.css"

import {

  Link

} from
"react-router-dom"

import Navbar
from "../components/Navbar/Navbar"

import {

  motion

} from
"framer-motion"

function NotFound() {

  return (

    <>

      <Navbar />

      <section className="notfound-page">

        <motion.div

          className="notfound-content"

          initial={{

            opacity:0,

            y:40

          }}

          animate={{

            opacity:1,

            y:0

          }}

          transition={{

            duration:0.8

          }}

        >

          <h1>

            404

          </h1>

          <h2>

            PAGE NOT FOUND

          </h2>

          <p>

            The luxury page you are
            looking for does not exist.

          </p>

          <Link to="/">

            <button>

              BACK HOME

            </button>

          </Link>

        </motion.div>

      </section>

    </>

  )

}

export default NotFound