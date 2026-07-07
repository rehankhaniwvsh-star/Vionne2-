import React from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Download,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Package
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function OrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    const unsubscribe = adminService.getOrders((fetchedOrders) => {
      setOrders(fetchedOrders);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateOrderStatus(id, status);
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.shortId && o.shortId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Delivered</Badge>;
      case 'Shipped':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-lg flex items-center gap-1.5"><Truck className="h-3 w-3" /> Shipped</Badge>;
      case 'Pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 rounded-lg flex items-center gap-1.5"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'Cancelled':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg flex items-center gap-1.5"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
          <h1 className="text-3xl font-black tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">Track and manage customer transactions.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Total Orders', value: orders.length.toString(), icon: Package },
          { label: 'Pending', value: orders.filter(o => o.status === 'Pending').length.toString(), icon: Clock },
          { label: 'Shipped', value: orders.filter(o => o.status === 'Shipped').length.toString(), icon: Truck },
          { label: 'Completed', value: orders.filter(o => o.status === 'Delivered').length.toString(), icon: CheckCircle2 },
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-black tracking-tight">{stat.value}</p>
              </div>
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
                placeholder="Find orders, customers..."
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
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">ID</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Customer</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Status</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right">Total</TableHead>
                <TableHead className="w-[80px] py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : filteredOrders.map((order) => (
                <TableRow key={order.id} className="group hover:bg-muted/30 border-border/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold opacity-60">#{order.shortId || order.id.substring(0, 6)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-bold text-sm tracking-tight">{order.customer.name}</div>
                    <div className="text-[10px] font-bold text-muted-foreground mt-0.5">{order.customer.email}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="text-sm font-black tracking-tight italic">₹{Number(order.total).toLocaleString('en-IN')}</div>
                    <div className="text-[10px] font-medium text-muted-foreground">{order.items.length} items</div>
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
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60 p-2">Order Options</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg py-2 cursor-pointer" onClick={() => handleUpdateStatus(order.id, 'Shipped')}>
                            <Truck className="mr-2 h-4 w-4 opacity-60" /> Mark as Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg py-2 cursor-pointer" onClick={() => handleUpdateStatus(order.id, 'Delivered')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 opacity-60" /> Mark as Delivered
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="rounded-lg py-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                          >
                            <XCircle className="mr-2 h-4 w-4 opacity-60" /> Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
