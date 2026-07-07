import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Calendar,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

const data = [
  { name: 'Monday', value: 4000 },
  { name: 'Tuesday', value: 3000 },
  { name: 'Wednesday', value: 2000 },
  { name: 'Thursday', value: 2780 },
  { name: 'Friday', value: 1890 },
  { name: 'Saturday', value: 2390 },
  { name: 'Sunday', value: 3490 },
];

const categoryData = [
  { name: 'Bags', value: 400 },
  { name: 'Accessories', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Leather', value: 200 },
];

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E'];

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">Deep dive into your store's performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-border/50 h-10 font-bold text-xs uppercase tracking-widest bg-card/50">
            <Calendar className="mr-2 h-4 w-4" /> Last 30 Days
          </Button>
          <Button className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
            <Download className="mr-2 h-4 w-4" /> Export All Data
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         {[
           { label: 'Avg. Order Value', value: '₹2,450', trend: '+4.5%', up: true },
           { label: 'Conversion Rate', value: '3.2%', trend: '+0.4%', up: true },
           { label: 'Bounce Rate', value: '42%', trend: '-2.1%', up: true },
           { label: 'Session Duration', value: '2m 45s', trend: '-15s', up: false },
         ].map((stat, i) => (
           <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
             <CardContent className="p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                  <span className={cn("text-[10px] font-bold", stat.up ? "text-emerald-500" : "text-destructive")}>
                    {stat.trend}
                  </span>
                </div>
             </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Traffic Sources</CardTitle>
            <CardDescription className="text-xs font-medium italic">Where your visitors are coming from.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => value.substring(0, 3)}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderRadius: '12px',
                    borderColor: 'hsl(var(--border))'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Sales by Category</CardTitle>
            <CardDescription className="text-xs font-medium italic">Product distribution across your store.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderRadius: '12px',
                      borderColor: 'hsl(var(--border))'
                    }}
                  />
                </PieChart>
             </ResponsiveContainer>
             <div className="flex flex-col gap-2 pr-8">
                {categoryData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-nowrap">{entry.name}</span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Utility import for cn
import { cn } from '@/lib/utils';
