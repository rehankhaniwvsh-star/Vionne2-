import React from 'react';
import { useCart } from '../../../store/useCart';
import { Minus, Plus, X, ArrowRight, ShoppingBag, ShieldCheck, Zap, Truck, RotateCcw, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartPageProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onCheckout, onContinueShopping }) => {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-950">Your Cart is Empty</h1>
          <p className="text-zinc-500 text-sm max-w-sm">Discover our high-demand viral collection and grab exclusive flash deals today.</p>
        </div>
        <button 
          onClick={onContinueShopping}
          className="bg-black text-white px-8 py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg"
        >
          Explore Best Sellers
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/40 pt-8 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-zinc-200 gap-2">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-950">Shopping Bag</h1>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            {items.reduce((s, i) => s + i.quantity, 0)} Items in Cart
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cart Items List - 8 Cols */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={`${item.id}-${item.selectedVariant}`}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-4 md:p-6 rounded-2xl border border-zinc-200/90 shadow-sm flex items-center space-x-4 md:space-x-6"
                >
                  <div className="w-20 md:w-28 aspect-[4/5] bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=800';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2 md:space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-sm md:text-base font-bold text-zinc-950 line-clamp-1">{item.title}</h3>
                        <p className="text-[11px] font-semibold text-zinc-500">{item.selectedVariant}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id, item.selectedVariant)}
                        className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center border border-zinc-300 rounded-lg bg-zinc-50 px-2 py-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity - 1)}
                          className="p-1 text-zinc-600 hover:text-black"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-zinc-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity + 1)}
                          className="p-1 text-zinc-600 hover:text-black"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm md:text-base font-serif font-bold text-zinc-950">
                          ₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Shopping Guarantees Banner */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-950">
              <span className="flex items-center gap-2 font-bold">
                <Truck size={16} className="text-emerald-600" />
                Free Nationwide Express Shipping on this order!
              </span>
              <span className="font-semibold text-[11px] text-emerald-800 hidden sm:inline">
                Cash on Delivery & Instant UPI Accepted
              </span>
            </div>
          </div>

          {/* Cart Summary - 4 Cols */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-lg space-y-6 sticky top-28">
              <h2 className="text-xl font-serif font-bold text-zinc-950">Order Summary</h2>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-zinc-900">₹{(Number(total) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Estimated Shipping</span>
                  <span className="text-emerald-700 font-extrabold uppercase text-[10px] tracking-wider">FREE</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Prepaid Instant Discount</span>
                  <span className="text-amber-600 font-bold">5% Applied at Checkout</span>
                </div>
                <div className="pt-3 border-t border-zinc-200 flex justify-between font-serif font-black text-base text-zinc-950">
                  <span>Estimated Total</span>
                  <span className="text-xl font-bold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={onCheckout}
                  className="w-full bg-[#28402c] text-white py-3.5 px-6 rounded-md text-xs font-medium uppercase tracking-widest hover:bg-[#1e3021] transition-all flex items-center justify-center space-x-2.5 shadow-xs group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={onContinueShopping}
                  className="w-full text-center text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black py-2"
                >
                  Continue Shopping
                </button>
              </div>
              
              <div className="pt-4 border-t border-zinc-100 text-[10px] text-zinc-400 text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-zinc-600 font-semibold">
                  <Lock size={12} className="text-emerald-600" />
                  <span>256-Bit SSL Encrypted Checkout</span>
                </div>
                <p>Cash on Delivery & 30-Day Doorstep Replacement Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
