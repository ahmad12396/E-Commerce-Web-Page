import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/cartcontext";

// User Pages
import ProductsList from "./pages/Products/products_list";
import ProductDetails from "./pages/Products/product_details";
import CartPage from "./pages/Cart/cartpage";
import CheckoutPage from "./pages/Cart/checkout";
import LoginPage from "./pages/Login/login";
import SignupPage from "./pages/Login/signup";
import ProfilePage from "./pages/Login/profile"; 

// Admin Pages (Import your new admin files)
import AdminLogin from "./pages/Admin/adminlogin";
import AdminDashboard from "./pages/Admin/admindashboard";
import AdminProducts from "./pages/Admin/adminproducts";
import AdminOrders from "./pages/Admin/adminorders";   
import AdminUsers from "./pages/Admin/adminusers";

// Components
import NavBar from "./components/navbar";
import PrivateRouter from "./components/privaterouter"; 

function App() {
  return (
    <CartProvider>
      <Router>
        <NavBar />
        
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<ProductsList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* --- Admin Routes --- */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />

          {/* --- Protected User Routes --- */}
          <Route element={<PrivateRouter />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<div className="pt-24 text-center">Page Not Found</div>} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;