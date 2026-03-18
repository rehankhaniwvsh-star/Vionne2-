import React, { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, ChevronLeft } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import { motion, AnimatePresence } from 'motion/react';

interface TrackOrderPageProps {
  onBack: () => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ onBack }) => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // Remove '#' if user included it
      const cleanId = orderId.startsWith('#') ? orderId.slice(1) : orderId;
      const result = await adminService.getOrderByTrackingId(cleanId, email);
      
      if (result) {
        setOrder(result);
      } else {
        setError('Order not found. Please check your Order ID and Email.');
      }
    } catch (err) {
      setError('An error occurred while fetching your order.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['Pending', 'Shipped', 'Delivered'];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-2xl">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-black/40 hover:text-black transition-colors mb-8 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Store</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif tracking-tight mb-4">Track Your Order</h1>
          <p className="text-black/60 font-light">Enter your order details to see real-time status updates.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm mb-8">
          <form onSubmit={handleTrack} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2 block">Order ID</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. #ABC123" 
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2 block">Email Address</label>
                <input 
                  required
                  type="email" 
                  placeholder="The email used for purchase" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-black/10 py-3 text-sm focus:border-black outline-none transition-colors"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black/90 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={14} />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center text-red-500 text-xs font-medium"
            >
              {error}
            </motion.p>
          )}
        </div>

        <AnimatePresence>
          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Status Timeline */}
              <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-black/5 rounded-lg">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Status</p>
                      <p className="text-lg font-medium">{order.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">Order Date</p>
                    <p className="text-sm">{order.createdAt?.toDate().toLocaleDateString() || order.date}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black/5 -translate-y-1/2" />
                  <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-black -translate-y-1/2 transition-all duration-1000" 
                    style={{ width: `${(getStatusStep(order.status) / 2) * 100}%` }}
                  />
                  
                  <div className="relative flex justify-between">
                    {[
                      { label: 'Confirmed', icon: Clock, status: 'Pending' },
                      { label: 'Shipped', icon: Truck, status: 'Shipped' },
                      { label: 'Delivered', icon: CheckCircle, status: 'Delivered' }
                    ].map((step, idx) => {
                      const isActive = getStatusStep(order.status) >= idx;
                      const Icon = step.icon;
                      return (
                        <div key={step.label} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
                            isActive ? 'bg-black text-white' : 'bg-white border border-black/10 text-black/20'
                          }`}>
                            <Icon size={18} />
                          </div>
                          <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${
                            isActive ? 'text-black' : 'text-black/20'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Details Summary */}
              <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-6">Order Summary</h3>
                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#F5F5F0] rounded overflow-hidden">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-black/40">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-between items-center">
                    <p className="text-sm font-bold uppercase tracking-widest">Total Amount</p>
                    <p className="text-xl font-serif">₹{order.total.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
