import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  ArrowUpRight,
  Clock,
  Package,
  ChevronDown,
  UserCheck,
  Globe,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';

// Mock Data for charts (since calculating historical trends from a flat list is complex for a simple dashboard)
// In a real production app, you'd have a separate collection for daily/weekly stats.
const weeklyData = [
  { name: 'Mon', revenue: 4200, orders: 24, customers: 18 },
  { name: 'Tue', revenue: 3800, orders: 18, customers: 15 },
  { name: 'Wed', revenue: 5100, orders: 32, customers: 28 },
  { name: 'Thu', revenue: 4800, orders: 28, customers: 22 },
  { name: 'Fri', revenue: 6200, orders: 45, customers: 38 },
  { name: 'Sat', revenue: 7500, orders: 58, customers: 52 },
  { name: 'Sun', revenue: 6800, orders: 42, customers: 35 },
];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-zinc-50 rounded-xl text-zinc-600">
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
        trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
      }`}>
        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {change}%
      </div>
    </div>
    <h3 className="text-zinc-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
  </motion.div>
);

const RecentOrder = ({ id, customer, product, amount, status }: any) => (
  <div className="flex items-center justify-between py-4 border-b border-zinc-50 last:border-0 group hover:bg-zinc-50/50 px-4 -mx-4 rounded-xl transition-colors cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400">
        <Package size={20} />
      </div>
      <div>
        <h4 className="font-bold text-sm truncate max-w-[150px]">{product}</h4>
        <p className="text-xs text-zinc-400 truncate max-w-[150px]">{customer} • {id}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-sm">₹{amount.toLocaleString('en-IN')}</p>
      <div className="flex items-center gap-1 justify-end">
        <div className={`w-1.5 h-1.5 rounded-full ${
          status === 'Delivered' ? 'bg-emerald-500' : 
          status === 'Shipped' ? 'bg-blue-500' : 'bg-amber-500'
        }`} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{status}</span>
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubOrders = adminService.getOrders((data) => setOrders(data));
    const unsubProducts = adminService.getProducts((data) => setProducts(data));
    const unsubCustomers = adminService.getCustomers((data) => {
      setCustomers(data);
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubCustomers();
    };
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate top products based on real orders
  const productSales: Record<string, { sales: number, revenue: number }> = {};
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      if (!productSales[item.title]) {
        productSales[item.title] = { sales: 0, revenue: 0 };
      }
      productSales[item.title].sales += item.quantity || 1;
      productSales[item.title].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });

  const topProductsData = Object.entries(productSales)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-zinc-400 mt-1">Real-time overview of your store's performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-zinc-100 shadow-sm">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                timeRange === range 
                  ? 'bg-black text-white shadow-lg shadow-black/10' 
                  : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString('en-IN')}`} 
          change="12.5" 
          icon={DollarSign} 
          trend="up" 
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders.toLocaleString()} 
          change="8.2" 
          icon={ShoppingBag} 
          trend="up" 
        />
        <StatCard 
          title="Active Customers" 
          value={totalCustomers.toLocaleString()} 
          change="3.1" 
          icon={Users} 
          trend="up" 
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`₹${avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} 
          change="4.5" 
          icon={ArrowUpRight} 
          trend="up" 
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trends (Using weeklyData mock for visual representation as historical data is complex) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg">Sales Trends</h3>
              <p className="text-xs text-zinc-400 mt-1">Revenue and order volume over time</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 500 }} 
                />
                <Tooltip 
                  cursor={{ stroke: '#f4f4f5', strokeWidth: 2 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#000" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg">Top Products</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">By Sales Volume</p>
            </div>
            <button 
              onClick={() => navigate('/admin/products')}
              className="p-2 hover:bg-zinc-50 rounded-lg transition-colors text-zinc-400 hover:text-black"
              title="View Inventory Report"
            >
              <BarChart3 size={20} />
            </button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#71717a', fontWeight: 600 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8f8f8' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#000" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-lg">Recent Activity</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Latest Orders</p>
          </div>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
          >
            <span>View All Activity</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
          {orders.slice(0, 6).map((order) => (
            <RecentOrder 
              key={order.id}
              id={`#${order.id.slice(-6).toUpperCase()}`} 
              customer={order.customer.name} 
              product={order.items?.[0]?.title || 'Order'} 
              amount={order.total} 
              status={order.status} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
