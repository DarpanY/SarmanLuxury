import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import Home from "./pages/Home"
import Collections from "./pages/Collections"
import Men from "./pages/Men"
import Women from "./pages/Women"
import Accessories from "./pages/Accessories"
import Contact from "./pages/Contact"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Product from "./pages/Product"
import Wishlist from "./pages/Wishlist"
import Profile from "./pages/Profile"
import ProtectedRoute from "./components/ProtectedRoute"
import Admin from "./pages/Admin"
import RoleRoute from "./components/RoleRoute"
import Orders from "./pages/Orders"
import AdminProducts from "./pages/AdminProducts"
import Search from "./pages/Search"
import NotFound from "./pages/NotFound"
import Analysis from "./pages/Analysis"
import WhatsAppBubble from "./components/WhatsAppBubble/WhatsAppBubble"
function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="*"
          element={<NotFound />}
        />
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={[
              "superadmin",
              "admin",
              "staff"]}>
              <Admin />
            </RoleRoute>
          }
        />

        <Route
          path="/collections"
          element={<Collections />}
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
        }
        />

        <Route
          path="/men"
          element={<Men />}
        />

        <Route
          path="/women"
          element={<Women />}
        />

        <Route
          path="/accessories"
          element={<Accessories />}
        />
        <Route
          path="/contact"
          element={<Contact />}
        />
        <Route
          path="/cart"
          element={<Cart />}
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
        }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/product/:id"
          element={<Product />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-products"
          element={
            <RoleRoute allowedRoles={[
              "superadmin",
              "admin",
              "staff"]}>
              <AdminProducts />
            </RoleRoute>
          }
        />
        <Route
          path="/search"
          element={<Search />}
        />

        <Route
          path="/analysis"
          element={
            <RoleRoute allowedRoles={["superadmin"]}>
              <Analysis />
            </RoleRoute>
          }
        />

      </Routes>

      <WhatsAppBubble />

    </BrowserRouter>

  )

}

export default App
