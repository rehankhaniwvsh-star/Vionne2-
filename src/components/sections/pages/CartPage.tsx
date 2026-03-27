import React from 'react';
import { useCart } from '../../../store/useCart';
import { Minus, Plus, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartPageProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onCheckout, onContinueShopping }) => {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={64} className="text-black/10 mb-8" />
        <h1 className="text-3xl font-serif tracking-tight mb-4">Your cart is empty</h1>
        <p className="text-black/60 mb-10 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={onContinueShopping}
          className="bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-serif tracking-tight mb-16">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={`${item.id}-${item.selectedVariant}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-start space-x-6 pb-8 border-b border-black/5"
                >
                  <div className="w-24 sm:w-32 aspect-[4/5] bg-[#F5F5F0] overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      referrerPolicy="no-referrer" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://picsum.photos/seed/placeholder/400/500';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium tracking-tight">{item.title}</h3>
                        <p className="text-xs text-black/40 uppercase tracking-widest mt-1">{item.selectedVariant}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id, item.selectedVariant)}
                        className="text-black/40 hover:text-black transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex items-center border border-black/10 px-3 py-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity - 1)}
                          className="p-1 hover:text-black/50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity + 1)}
                          className="p-1 hover:text-black/50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-medium">₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#F5F5F0] p-8 space-y-8 sticky top-32">
              <h2 className="text-xl font-serif tracking-tight">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Subtotal</span>
                  <span>₹{(Number(total) || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                </div>
                <div className="pt-4 border-t border-black/5 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={onCheckout}
                  className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center space-x-3"
                >
                  <span>Checkout</span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  onClick={onContinueShopping}
                  className="w-full text-center text-[10px] font-bold uppercase tracking-widest hover:text-black/50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
              
              <div className="pt-4 text-[10px] text-black/40 text-center uppercase tracking-widest leading-relaxed">
                Taxes and shipping calculated at checkout.<br />
                Secure SSL encrypted payments.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
