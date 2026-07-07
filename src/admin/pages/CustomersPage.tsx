import React from 'react';
import { adminService } from '../../services/adminService';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Calendar,
  UserPlus,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { cn } from '@/lib/utils';

export function CustomersPage() {
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const unsubscribe = adminService.getCustomers((fetchedCustomers) => {
      setCustomers(fetchedCustomers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (spent: number) => {
    if (spent > 20000) return 'VIP';
    if (spent > 0) return 'Active';
    return 'Inactive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">Understand your audience and their purchase history.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Total Customers', value: customers.length.toString(), desc: 'Engaged users' },
          { label: 'VIP Shoppers', value: customers.filter(c => (c.totalSpent || 0) > 20000).length.toString(), desc: 'Spent over ₹20k' },
          { label: 'Total Community Value', value: `₹${customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString('en-IN')}`, desc: 'Lifetime spend summary' },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-black tracking-tight mt-1">{stat.value}</p>
              <p className="text-[10px] font-medium text-emerald-500 mt-2">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search customers by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl bg-transparent border-border/50 h-10 w-full md:max-w-sm focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Customer</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Status</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Orders</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Total Spent</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right">Last Purchase</TableHead>
                <TableHead className="w-[80px] py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.map((customer) => {
                const status = getStatus(customer.totalSpent || 0);
                const lastOrderDate = customer.lastOrder?.toDate ? customer.lastOrder.toDate().toLocaleDateString() : 'N/A';
                return (
                  <TableRow key={customer.id} className="group hover:bg-muted/30 border-border/50 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/50">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-sm tracking-tight">{customer.name}</div>
                          <div className="text-[10px] font-bold text-muted-foreground mt-0.5">{customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={cn(
                        "rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border",
                        status === 'VIP' ? "bg-primary/20 text-primary border-primary/30" : 
                        (status === 'Active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground border-transparent")
                      )}>
                        {status === 'VIP' && <Star className="mr-1 h-2.5 w-2.5 fill-primary" />}
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm font-bold tracking-tight">{customer.ordersCount || 0}</div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase">Orders</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm font-black tracking-tight">₹{(customer.totalSpent || 0).toLocaleString('en-IN')}</div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Total Value</div>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="text-xs font-bold text-foreground">{lastOrderDate}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 border border-transparent hover:border-border/50 hover:bg-muted/50 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-card/95 backdrop-blur-xl">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60 p-2">Customer Profile</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-lg py-2 cursor-pointer">
                              <Mail className="mr-2 h-4 w-4 opacity-60" /> Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg py-2 cursor-pointer">
                              <Phone className="mr-2 h-4 w-4 opacity-60" /> Call Customer
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
