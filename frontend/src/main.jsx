import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { CartProvider } from './context/cartcontext.jsx';

createRoot(document.getElementById('root')).render(
    <CartProvider>
      <App />
    </CartProvider>
)
