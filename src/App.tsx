/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { FeaturedProducts } from './components/sections/FeaturedProducts';
import { Benefits } from './components/sections/Benefits';
import { Testimonials } from './components/sections/Testimonials';
import { ProductPage } from './components/sections/pages/ProductPage';
import { CartPage } from './components/sections/pages/CartPage';
import { CheckoutPage } from './components/sections/pages/CheckoutPage';
import { AboutPage } from './components/sections/pages/AboutPage';
import { ContactPage } from './components/sections/pages/ContactPage';
import { TrackOrderPage } from './components/sections/pages/TrackOrderPage';
import { Product } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from './store/useCart';

// Admin Imports
import { AdminLayout } from './admin/AdminLayout';
import { Dashboard } from './admin/Dashboard';
import { Products } from './admin/Products';
import { Orders } from './admin/Orders';
import { Customers } from './admin/Customers';
import { Settings } from './admin/Settings';
import { Login } from './admin/Login';

import { useNavigate } from 'react-router-dom';

const StorefrontLayout = ({ children, hideHeaderFooter = false }: { children: React.ReactNode, hideHeaderFooter?: boolean }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeaderFooter && <Header onNavigate={(page) => navigate(page === 'home' ? '/' : `/${page}`)} currentPage="home" />}
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Storefront Routes */}
      <Route path="/" element={
        <StorefrontLayout>
          <Hero onShopNow={() => document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' })} />
          <Benefits />
          <FeaturedProducts onProductClick={(p) => navigate(`/product/${p.id}`)} />
          <Testimonials />
          <section className="py-24 bg-black text-white text-center">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-serif mb-8">Join the Vionne Circle</h2>
              <p className="text-white/60 mb-10 max-w-md mx-auto">Receive exclusive early access to new collections and minimalist living tips.</p>
              <div className="flex max-w-md mx-auto border-b border-white/30 pb-2">
                <input type="email" placeholder="Email Address" className="bg-transparent border-none outline-none w-full text-sm" />
                <button className="text-xs font-bold uppercase tracking-widest">Subscribe</button>
              </div>
            </div>
          </section>
        </StorefrontLayout>
      } />
      <Route path="/product/:id" element={<StorefrontLayout><ProductPage /></StorefrontLayout>} />
      <Route path="/cart" element={<StorefrontLayout><CartPage onCheckout={() => navigate('/checkout')} onContinueShopping={() => navigate('/')} /></StorefrontLayout>} />
      <Route path="/checkout" element={<StorefrontLayout hideHeaderFooter><CheckoutPage onBack={() => navigate('/cart')} onComplete={() => {}} /></StorefrontLayout>} />
      <Route path="/about" element={<StorefrontLayout><AboutPage /></StorefrontLayout>} />
      <Route path="/contact" element={<StorefrontLayout><ContactPage /></StorefrontLayout>} />
      <Route path="/track-order" element={<StorefrontLayout><TrackOrderPage onBack={() => navigate('/')} /></StorefrontLayout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><Products /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><Orders /></AdminLayout>} />
        <Route path="/admin/customers" element={<AdminLayout><Customers /></AdminLayout>} />
        <Route path="/admin/website" element={<AdminLayout><Settings /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

