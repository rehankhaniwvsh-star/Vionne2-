import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { adminService } from '../services/adminService';

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: {
    title: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'COD' | 'Credit Card';
  date: string;
  createdAt?: any;
}

const initialOrders: Order[] = [
  {
    id: 'ORD-7241',
    customer: { name: 'Emma Watson', email: 'emma@example.com', phone: '+1 234 567 890', address: '123 Luxury Ave, Beverly Hills, CA 90210' },
    items: [{ title: 'Minimalist Watch', price: 129.00, quantity: 1, image: 'https://picsum.photos/seed/watch/100/100' }],
    total: 129.00,
    status: 'Delivered',
    paymentMethod: 'Credit Card',
    date: '2024-03-15 14:30'
  },
  {
    id: 'ORD-7242',
    customer: { name: 'James Miller', email: 'james@example.com', phone: '+1 987 654 321', address: '456 Minimalist St, New York, NY 10001' },
    items: [{ title: 'Leather Wallet', price: 45.00, quantity: 1, image: 'https://picsum.photos/seed/wallet/100/100' }],
    total: 45.00,
    status: 'Shipped',
    paymentMethod: 'COD',
    date: '2024-03-16 09:15'
  },
  {
    id: 'ORD-7243',
    customer: { name: 'Sarah Chen', email: 'sarah@example.com', phone: '+1 555 012 345', address: '789 Zen Garden, San Francisco, CA 94105' },
    items: [{ title: 'Ceramic Vase', price: 89.00, quantity: 1, image: 'https://picsum.photos/seed/vase/100/100' }],
    total: 89.00,
    status: 'Pending',
    paymentMethod: 'COD',
    date: '2024-03-17 11:45'
  }
];

export const OrderDetails = ({ 
  order, 
  onClose, 
  onStatusUpdate,
  onUpdate
}: { 
  order: Order, 
  onClose: () => void,
  onStatusUpdate: (id: string, status: any) => Promise<void>,
  onUpdate: (id: string, data: any) => Promise<void>
}) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(order);

  const handleCopy = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyFeedback(type);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleWhatsApp = () => {
    if (!order.customer.phone) return;
    const cleanPhone = order.customer.phone.replace(/\D/g, '');
    const text = `Hello ${order.customer.name}, this is regarding your order ${order.id}. Current status: ${order.status}.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmail = () => {
    if (!order.customer.email) return;
    const subject = `Order ${order.id} Update`;
    const body = `Hello ${order.customer.name}, your order ${order.id} is now ${order.status}.`;
    window.location.href = `mailto:${order.customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleStatusChange = async (newStatus: any) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(order.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
    >
      <div className="p-8 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h3 className="text-xl font-bold">{order.id}</h3>
          <p className="text-sm text-zinc-400 font-medium">
            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : order.date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
            >
              Edit Details
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-10 flex-grow">
        <div className="flex items-center justify-between p-6 bg-zinc-50 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' :
              order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' : 
              order.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {order.status === 'Delivered' ? <CheckCircle2 size={24} /> :
               order.status === 'Shipped' ? <Truck size={24} /> : 
               order.status === 'Cancelled' ? <X size={24} /> : <Clock size={24} />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Order Status</p>
              <p className="font-bold text-lg">{order.status}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              value={order.status}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Customer Details</h4>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">Name</label>
                  <input 
                    type="text" 
                    value={editData.customer.name}
                    onChange={(e) => setEditData({...editData, customer: {...editData.customer, name: e.target.value}})}
                    className="w-full border-b border-zinc-200 py-2 text-sm focus:border-black outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">Email</label>
                  <input 
                    type="email" 
                    value={editData.customer.email}
                    onChange={(e) => setEditData({...editData, customer: {...editData.customer, email: e.target.value}})}
                    className="w-full border-b border-zinc-200 py-2 text-sm focus:border-black outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">Phone</label>
                  <input 
                    type="text" 
                    value={editData.customer.phone}
                    onChange={(e) => setEditData({...editData, customer: {...editData.customer, phone: e.target.value}})}
                    className="w-full border-b border-zinc-200 py-2 text-sm focus:border-black outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 block">Address</label>
                  <textarea 
                    value={editData.customer.address}
                    onChange={(e) => setEditData({...editData, customer: {...editData.customer, address: e.target.value}})}
                    className="w-full border-b border-zinc-200 py-2 text-sm focus:border-black outline-none transition-colors min-h-[80px]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-medium">
                  <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400"><Mail size={16} /></div>
                  {order.customer.email || 'No email provided'}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400"><Phone size={16} /></div>
                  {order.customer.phone || 'No phone provided'}
                </div>
                <div className="flex items-start gap-3 text-sm font-medium">
                  <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400 mt-0.5"><MapPin size={16} /></div>
                  {order.customer.address}
                </div>
              </div>
            )}
            {!isEditing && (
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <button 
                    onClick={handleWhatsApp}
                    disabled={!order.customer.phone}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Phone size={14} />
                    WhatsApp
                  </button>
                  <button 
                    onClick={handleEmail}
                    disabled={!order.customer.email}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail size={14} />
                    Email
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCopy(order.customer.phone, 'phone')}
                    disabled={!order.customer.phone}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-zinc-100 text-zinc-500 rounded-xl text-[10px] font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copyFeedback === 'phone' ? 'Copied!' : 'Copy Phone'}
                  </button>
                  <button 
                    onClick={() => handleCopy(order.customer.email, 'email')}
                    disabled={!order.customer.email}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-zinc-100 text-zinc-500 rounded-xl text-[10px] font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copyFeedback === 'email' ? 'Copied!' : 'Copy Email'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Payment Info</h4>
            <div className="flex items-center gap-3 text-sm font-medium">
              <div className="p-2 bg-zinc-50 rounded-lg text-zinc-400"><CreditCard size={16} /></div>
              {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Credit Card (Paid)'}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="pt-6 border-t border-zinc-100 flex gap-4">
            <button 
              onClick={handleSaveEdit}
              disabled={isUpdating}
              className="flex-grow bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setEditData(order);
              }}
              className="px-8 py-3 rounded-xl border border-zinc-100 font-bold hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Order Items</h4>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-zinc-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-zinc-50 overflow-hidden border border-zinc-100">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm">{item.title}</h5>
                    <p className="text-xs text-zinc-400 font-medium">₹{(Number(item.price) || 0).toLocaleString('en-IN')} x {item.quantity}</p>
                  </div>
                </div>
                <p className="font-bold text-sm">₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 space-y-3">
          <div className="flex justify-between text-sm font-medium text-zinc-500">
            <span>Subtotal</span>
            <span>₹{(Number(order.total) || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-zinc-500">
            <span>Shipping</span>
            <span>₹0</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-zinc-50">
            <span>Total</span>
            <span>₹{(Number(order.total) || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex gap-4">
        <button 
          onClick={() => window.print()}
          className="flex-grow bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10"
        >
          <Download size={18} />
          Download Invoice
        </button>
      </div>
    </motion.div>
  );
};

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedOrder = useMemo(() => 
    orders.find(o => o.id === selectedOrderId), 
    [orders, selectedOrderId]
  );

  React.useEffect(() => {
    const unsubscribe = adminService.getOrders((newOrders) => {
      setOrders(newOrders);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-zinc-400 mt-1">Track and manage customer orders.</p>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderId(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <OrderDetails 
              order={selectedOrder} 
              onClose={() => setSelectedOrderId(null)} 
              onStatusUpdate={async (id, status) => {
                await adminService.updateOrderStatus(id, status);
              }}
              onUpdate={async (id, data) => {
                await adminService.updateOrder(id, data);
              }}
            />
          </>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search orders by ID or customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 relative">
            <div className="relative group">
              <button 
                onClick={() => setStatusFilter(statusFilter === 'All' ? 'Pending' : 'All')} // Simple toggle for now or better a real dropdown
                className="hidden" // We will replace the select below
              />
            </div>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl border border-zinc-100 text-sm font-bold hover:bg-zinc-50 transition-colors outline-none bg-white cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" size={14} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{order.customer.name}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{order.customer.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 font-medium">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : order.date}
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">₹{(Number(order.total) || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                      order.status === 'Shipped' ? 'bg-blue-50 text-blue-600' : 
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-emerald-500' :
                        order.status === 'Shipped' ? 'bg-blue-500' : 
                        order.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'
                      }`} />
                      {order.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrderId(order.id)}
                      className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-zinc-50 flex items-center justify-between">
          <p className="text-xs text-zinc-400 font-medium">Showing {filteredOrders.length} of {orders.length} orders</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-zinc-100 rounded-lg hover:bg-zinc-50 disabled:opacity-50" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="p-2 border border-zinc-100 rounded-lg hover:bg-zinc-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
