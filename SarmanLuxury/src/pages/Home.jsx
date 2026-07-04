import Navbar from "../components/Navbar/Navbar"
import Hero from "../components/Hero/Hero"
import Categories from "../components/Categories/Categories"
import Footer from "../components/Footer/Footer"
import FeaturedProducts from "../components/FeaturedProducts/FeaturedProducts"
import BestSeller from "../components/BestSeller/BestSeller"
import Testimonials from "../components/Testimonials/Testimonials"

function Home() {

  return (
    <>

      <Navbar />
      <Hero />
      <Categories />
      <BestSeller />
      <FeaturedProducts />
      <Testimonials />
      <Footer />

    </>
  )

}

export default Home
