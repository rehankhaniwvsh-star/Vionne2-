import React from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  User
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinDate: string;
}

const initialCustomers: Customer[] = [
  { id: 'CUST-001', name: 'Emma Watson', email: 'emma@example.com', phone: '+1 234 567 890', totalOrders: 12, totalSpent: 1450.00, lastOrder: '2024-03-15', joinDate: '2023-08-12' },
  { id: 'CUST-002', name: 'James Miller', email: 'james@example.com', phone: '+1 987 654 321', totalOrders: 5, totalSpent: 420.00, lastOrder: '2024-03-16', joinDate: '2023-11-05' },
  { id: 'CUST-003', name: 'Sarah Chen', email: 'sarah@example.com', phone: '+1 555 012 345', totalOrders: 8, totalSpent: 890.00, lastOrder: '2024-03-17', joinDate: '2023-09-20' },
  { id: 'CUST-004', name: 'Michael Ross', email: 'michael@example.com', phone: '+1 444 987 654', totalOrders: 3, totalSpent: 210.00, lastOrder: '2024-03-10', joinDate: '2024-01-15' },
];

import { adminService } from '../services/adminService';

export const Customers = () => {
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const unsubscribe = adminService.getCustomers((fetchedCustomers) => {
      setCustomers(fetchedCustomers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const name = c.name || '';
    const email = c.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-400 animate-pulse uppercase tracking-widest text-xs font-bold">Loading Customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-zinc-400 mt-1">Manage your customer base and view their history.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-zinc-100 text-sm font-bold hover:bg-zinc-50 transition-colors">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Last Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                        <User size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{customer.name}</span>
                        <span className="text-[10px] text-zinc-400 font-medium italic">
                          Joined {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString() : customer.joinDate}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <Mail size={12} />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <Phone size={12} />
                        {customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-600">
                      <ShoppingBag size={14} className="text-zinc-400" />
                      {customer.ordersCount || customer.totalOrders}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">₹{(customer.totalSpent || 0).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500 font-medium">
                    {customer.lastOrder?.toDate ? customer.lastOrder.toDate().toLocaleDateString() : customer.lastOrder}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-zinc-50 flex items-center justify-between">
          <p className="text-xs text-zinc-400 font-medium">Showing {filteredCustomers.length} of {customers.length} customers</p>
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
