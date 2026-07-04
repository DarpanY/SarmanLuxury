import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Toaster} from"react-hot-toast"
import './styles/Skeleton.css'
import './styles/variables.css'
import './styles/global.css'
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext'
import {AuthProvider} from "./context/AuthContext"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
          <Toaster
          position="top-right"
          toastOptions={{
            style:{
              background:"#081712",
              color:"#fff",
              border:"1px solid #c8a96b"
            }
          }}
          />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
)