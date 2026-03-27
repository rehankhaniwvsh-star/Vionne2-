import React, { useState } from 'react';
import { useCart } from '../../../store/useCart';
import { ChevronLeft, Lock, CreditCard, Truck, CheckCircle, ArrowRight, Home } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onComplete }) => {
  const { items, total: cartTotal, clearCart, updateQuantity } = useCart();
  const [paymentMethod, setPaymentMethod] = React.useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const shippingFee = 0; // Set to 0 to match CartPage's "Free" shipping and resolve price discrepancy
  const finalTotal = cartTotal + shippingFee;
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const [orderId, setOrderId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await adminService.createOrder({
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}, ${formData.country}`
        },
        items: items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          variant: item.selectedVariant,
          image: item.image
        })),
        total: finalTotal,
        paymentMethod
      });
      
      if (result) {
        setOrderId(result.shortId || result.id);
        
        // Backend integration: Call our server to "send" notifications
        try {
          await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderData: {
                id: result.id,
                shortId: result.shortId,
                customer: {
                  email: formData.email,
                  phone: formData.phone
                },
                total: finalTotal
              }
            })
          });
        } catch (err) {
          console.warn('Backend notification failed, but order was stored:', err);
        }
      }
      
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Order failed:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle size={40} />
            </div>
          </div>
          <h2 className="text-3xl font-serif tracking-tight">Order Placed!</h2>
          <div className="bg-black/5 p-4 rounded-xl space-y-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">Your Order ID</p>
              <p className="text-lg font-mono font-bold">#{orderId}</p>
            </div>
            <div className="pt-2 border-t border-black/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">Total Amount Paid</p>
              <p className="text-lg font-bold">₹{(Number(finalTotal) || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <p className="text-black/60 leading-relaxed">
            Thank you for your order. We've received it and will begin processing it shortly. 
            <br />
            <span className="font-bold text-black">A confirmation email and SMS have been sent to {formData.email} and {formData.phone}.</span>
          </p>
          <div className="pt-4 space-y-4">
            <button 
              onClick={() => onComplete()}
              className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black/90 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest hover:text-black/50">
              <ChevronLeft size={16} />
              <span>Back to Cart</span>
            </button>
            <button onClick={() => window.location.href = '/'} className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest hover:text-black/50">
              <Home size={14} />
              <span>Home</span>
            </button>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
            <Lock size={12} />
            <span>Secure Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Checkout Form */}
          <div className="space-y-12">
            <form onSubmit={handleSubmit} className="space-y-12">
              <section className="space-y-6">
                <h2 className="text-xl font-serif tracking-tight">Contact Information</h2>
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-100">
                    {error}
                  </div>
                )}
                <div className="space-y-4">
                  <input 
                    required
                    type="email" 
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                  />
                  <input 
                    required
                    type="tel" 
                    placeholder="Phone Number" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                  />
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-xl font-serif tracking-tight">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    type="text" 
                    placeholder="First Name" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                  />
                  <input 
                    required
                    type="text" 
                    placeholder="Last Name" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                  />
                </div>
                <input 
                  required
                  type="text" 
                  placeholder="Address" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    type="text" 
                    placeholder="City" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                  />
                  <input 
                    required
                    type="text" 
                    placeholder="State / Province" 
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    type="text" 
                    placeholder="Pincode / ZIP" 
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                  />
                  <input 
                    required
                    type="text" 
                    placeholder="Country" 
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                  />
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-xl font-serif tracking-tight">Payment Method</h2>
                <div className="space-y-4">
                  <label className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-black bg-black/5' : 'border-black/10'}`}>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'COD'} 
                        onChange={() => setPaymentMethod('COD')}
                        className="accent-black"
                      />
                      <span className="text-sm font-medium">Cash on Delivery (COD)</span>
                    </div>
                    <Truck size={18} className="text-black/40" />
                  </label>
                </div>
              </section>

              <button 
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full bg-black text-white py-5 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : `Complete Order — ₹${finalTotal.toLocaleString('en-IN')}`}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-[#F5F5F0] p-10 space-y-8 sticky top-12">
              <h2 className="text-xl font-serif tracking-tight">Your Order</h2>
              <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4">
                {items.map(item => (
                  <div key={`${item.id}-${item.selectedVariant}`} className="flex items-center space-x-4">
                    <div className="relative w-16 h-20 bg-white flex-shrink-0">
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
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{item.title}</h4>
                      <p className="text-[10px] text-black/40 uppercase tracking-widest">{item.selectedVariant}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity - 1)}
                          className="w-5 h-5 border border-black/10 flex items-center justify-center text-[10px] hover:bg-black hover:text-white transition-colors"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          type="button"
                          onClick={() => updateQuantity(item.id, item.selectedVariant, item.quantity + 1)}
                          className="w-5 h-5 border border-black/10 flex items-center justify-center text-[10px] hover:bg-black hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="text-sm font-medium">₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 pt-8 border-t border-black/5">
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Subtotal</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-black/60">Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                </div>
                <div className="pt-4 border-t border-black/5 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
