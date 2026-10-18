import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Collections from "./pages/Collections";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import ProductDetails from "./pages/ProductDetails";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import api, { setupAxiosInterceptors } from "./api/axios";
import "./App.css"

const App = () => {
  const { getToken } = useClerkAuth();

  useEffect(() => {
    // Setup axios interceptor when getToken is available
    if (getToken) {
      console.log("✅ App.jsx: Setting up axios interceptors");
      setupAxiosInterceptors(getToken);
    }
  }, [getToken]);

  return (
    <CartProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:mainCollection" element={<Collections />} />
            <Route path="/navratri" element={<Collections />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </CartProvider>
  );
};

export default App;
