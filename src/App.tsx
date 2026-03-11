import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import UserProfile from './pages/UserProfile';
import Wishlist from './pages/Wishlist';
import Search from './pages/Search';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import './index.css';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'https://poster-sensei-backend.vercel.app';

import { ThemeProvider } from './contexts/ThemeContext';

import { WishlistProvider } from './contexts/WishlistContext';
import ScrollToTop from './components/ScrollToTop';
import AdminLayout from './components/AdminLayout';

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  return (
    <>
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? "" : "page-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/gallery" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
            <Routes>
              {/* Admin Routes with distinct layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              {/* Customer Routes */}
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
