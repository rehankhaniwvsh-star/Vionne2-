import React from 'react';
import { adminService } from '../../services/adminService';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  Activity,
  ArrowUpRight,
  MoreVertical,
  Download
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const chartData = [
  { name: 'Jan', total: 4500 },
  { name: 'Feb', total: 3800 },
  { name: 'Mar', total: 5200 },
  { name: 'Apr', total: 4800 },
  { name: 'May', total: 6100 },
  { name: 'Jun', total: 5500 },
  { name: 'Jul', total: 6800 },
];

const areaData = [
  { name: 'Mon', revenue: 400 },
  { name: 'Tue', revenue: 600 },
  { name: 'Wed', revenue: 900 },
  { name: 'Thu', revenue: 700 },
  { name: 'Fri', revenue: 1200 },
  { name: 'Sat', revenue: 1500 },
  { name: 'Sun', revenue: 1100 },
];

export function DashboardPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubOrders = adminService.getOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
      setLoading(false);
    });

    const unsubCustomers = adminService.getCustomers((fetchedCustomers) => {
      setCustomers(fetchedCustomers);
    });

    return () => {
      unsubOrders();
      unsubCustomers();
    };
  }, []);

  // Calculate stats
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  
  const totalSales = orders.filter(o => o.status !== 'Cancelled').length;
  const recentOrders = orders.slice(0, 5);

  const revenueByDay = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, revenue: 0 }));
    
    // Last 7 days
    const now = new Date();
    orders.forEach(order => {
      const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
        const dayName = days[date.getDay()];
        const dayData = data.find(d => d.name === dayName);
        if (dayData) dayData.revenue += Number(order.total) || 0;
      }
    });

    // Reorder to put 'now' at the end
    const today = now.getDay();
    const reordered = [];
    for (let i = 1; i <= 7; i++) {
      const idx = (today + i) % 7;
      reordered.push(data[idx]);
    }
    return reordered;
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">System Overview</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Welcome back, Admin. Here's what's happening with Vionne today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-border/50 h-10 font-bold text-xs uppercase tracking-widest">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          description="Real-time collection total"
          icon={DollarSign}
          trend={{ value: "Live", isUp: true }}
        />
        <StatCard
          title="Total Customers"
          value={customers.length.toString()}
          description="Unique shoppers"
          icon={Users}
          trend={{ value: "N/A", isUp: true }}
        />
        <StatCard
          title="Total Sales"
          value={totalSales.toString()}
          description="Completed orders"
          icon={CreditCard}
          trend={{ value: "N/A", isUp: true }}
        />
        <StatCard
          title="Pending Orders"
          value={orders.filter(o => o.status === 'Pending').length.toString()}
          description="Awaiting action"
          icon={Activity}
          trend={{ value: "N/A", isUp: false }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="lg:col-span-4 border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Revenue History</CardTitle>
              <CardDescription className="text-xs font-medium">Daily revenue progression (Last 7 days)</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByDay} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales List */}
        <Card className="lg:col-span-3 border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Recent Sales</CardTitle>
            <CardDescription className="text-xs font-medium">Last {recentOrders.length} orders received.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs uppercase tracking-widest font-bold">No orders yet</div>
              ) : recentOrders.map((order, i) => (
                <div key={order.id} className="flex items-center gap-4 group cursor-pointer">
                  <Avatar className="h-10 w-10 border border-border/50 transition-transform group-hover:scale-105">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {order.customer.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-bold leading-none">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{order.customer.email}</p>
                  </div>
                  <div className="text-sm font-black tracking-tight">+₹{Number(order.total).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
            <Separator className="my-6 opacity-50" />
            <Button 
              variant="ghost" 
              className="w-full text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 hover:bg-primary/5"
              onClick={() => window.location.href = '/admin/orders'}
            >
              View All Orders <ArrowUpRight className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
