/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
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
import { Users as AdminUsers } from './admin/Users';
import { Settings } from './admin/Settings';
import { Login } from './admin/Login';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred.';
      let errorDetails = '';

      try {
        // Check if it's a Firestore error JSON string
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) {
          errorMessage = `Database Error: ${parsed.error}`;
          errorDetails = `Operation: ${parsed.operationType} on ${parsed.path}`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <X size={40} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-left">
              <p className="text-sm font-bold text-red-600 mb-1">{errorMessage}</p>
              {errorDetails && <p className="text-[10px] text-zinc-400 font-mono">{errorDetails}</p>}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
            >
              Reload Application
            </button>
            <p className="text-xs text-zinc-400">If the problem persists, please contact support.</p>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

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
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </Router>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

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
              {subscribed ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs"
                >
                  Thank you for subscribing!
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto border-b border-white/30 pb-2">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address" 
                    className="bg-transparent border-none outline-none w-full text-sm" 
                  />
                  <button type="submit" className="text-xs font-bold uppercase tracking-widest hover:text-white/70 transition-colors">Subscribe</button>
                </form>
              )}
            </div>
          </section>
        </StorefrontLayout>
      } />
      <Route path="/product/:id" element={<StorefrontLayout><ProductPage /></StorefrontLayout>} />
      <Route path="/cart" element={<StorefrontLayout><CartPage onCheckout={() => navigate('/checkout')} onContinueShopping={() => navigate('/')} /></StorefrontLayout>} />
      <Route path="/checkout" element={<StorefrontLayout hideHeaderFooter><CheckoutPage onBack={() => navigate('/cart')} onComplete={() => navigate('/')} /></StorefrontLayout>} />
      <Route path="/about" element={<StorefrontLayout><AboutPage /></StorefrontLayout>} />
      <Route path="/contact" element={<StorefrontLayout><ContactPage /></StorefrontLayout>} />
      <Route path="/track-order" element={<StorefrontLayout><TrackOrderPage onBack={() => navigate('/')} /></StorefrontLayout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><Products /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><Orders /></AdminLayout>} />
        <Route path="/admin/customers" element={<AdminLayout><Customers /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
        <Route path="/admin/website" element={<AdminLayout><Settings /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

