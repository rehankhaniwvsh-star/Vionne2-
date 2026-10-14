import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from 'sonner';
import { 
  Search, 
  MoreHorizontal, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Package,
  Trash2,
  FilePlus,
  FileText,
  AlertTriangle,
  Plus,
  X,
  CreditCard,
  Building,
  Smartphone,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  variant?: string;
  image?: string;
}

export function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dialog states
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isClearFakeModalOpen, setIsClearFakeModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  // Draft Order Form State
  const [draftForm, setDraftForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: '',
    paymentMethod: 'Manual Draft',
    paymentStatus: 'Pending',
    status: 'Draft',
    discountAmount: 0,
    shippingFee: 0,
    items: [] as OrderItem[],
  });

  // Load Real-time Orders & Catalog Products
  useEffect(() => {
    const unsubscribeOrders = adminService.getOrders(
      (fetchedOrders) => {
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (err) => {
        console.error('Orders snapshot error:', err);
        setLoading(false);
      }
    );

    const unsubscribeProducts = adminService.getProducts((fetchedProducts) => {
      setProducts(fetchedProducts);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  // Filter orders by search & tab status
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const customerName = String(o.customer?.name || '').toLowerCase();
      const customerEmail = String(o.customer?.email || '').toLowerCase();
      const orderId = String(o.id || '').toLowerCase();
      const shortId = String(o.shortId || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      const matchesSearch = 
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        orderId.includes(query) ||
        shortId.includes(query);

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'DRAFT') return o.status === 'Draft' || o.isDraft === true;
      if (statusFilter === 'PENDING') return o.status === 'Pending';
      if (statusFilter === 'PROCESSING') return o.status === 'Processing';
      if (statusFilter === 'SHIPPED') return o.status === 'Shipped';
      if (statusFilter === 'DELIVERED') return o.status === 'Delivered';
      if (statusFilter === 'CANCELLED') return o.status === 'Cancelled';

      return true;
    });
  }, [orders, searchTerm, statusFilter]);

  // Detected test / demo orders count
  const detectedFakeOrders = useMemo(() => {
    return orders.filter(o => {
      const email = String(o.customer?.email || '').toLowerCase();
      const name = String(o.customer?.name || '').toLowerCase();
      const phone = String(o.customer?.phone || '');
      const receipt = String(o.receipt || o.razorpay?.receipt || '').toLowerCase();

      return (
        email.includes('test') ||
        email.includes('example.com') ||
        email.includes('demo') ||
        email.includes('fake') ||
        name.includes('test') ||
        name.includes('demo') ||
        name.includes('fake') ||
        name.includes('sample') ||
        name === 'customer' ||
        phone === '9999999999' ||
        phone === '0000000000' ||
        receipt.includes('test_') ||
        o.isDemo === true
      );
    });
  }, [orders]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: orders.length,
      drafts: orders.filter(o => o.status === 'Draft' || o.isDraft === true).length,
      pending: orders.filter(o => o.status === 'Pending').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.status === 'Cancelled').length,
    };
  }, [orders]);

  // Status badge styling
  const getStatusBadge = (status: string, isDraft?: boolean) => {
    if (isDraft || status === 'Draft') {
      return (
        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 rounded-lg flex items-center gap-1.5 font-bold">
          <FileText className="h-3 w-3" /> Draft Order
        </Badge>
      );
    }
    switch (status) {
      case 'Processing':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 rounded-lg flex items-center gap-1.5 font-bold">
            <CreditCard className="h-3 w-3" /> Processing / Paid
          </Badge>
        );
      case 'Delivered':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-lg flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </Badge>
        );
      case 'Shipped':
        return (
          <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 rounded-lg flex items-center gap-1.5 font-bold">
            <Truck className="h-3 w-3" /> Shipped
          </Badge>
        );
      case 'Pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-lg flex items-center gap-1.5 font-bold">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'Cancelled':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg flex items-center gap-1.5 font-bold">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Status updater
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminService.updateOrderStatus(id, status);
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error('Failed to update order status');
    }
  };

  // Single Order Deletion
  const handleDeleteSingleOrder = async (id: string) => {
    try {
      await adminService.deleteOrder(id);
      setSelectedIds(prev => prev.filter(item => item !== id));
      toast.success('Order deleted successfully');
    } catch {
      toast.error('Failed to delete order');
    }
  };

  // Bulk Delete Selected
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await adminService.bulkDeleteOrders(selectedIds);
      toast.success(`Deleted ${selectedIds.length} order(s) successfully`);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to delete selected orders');
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear Fake / Demo Orders
  const handleClearFakeOrders = async () => {
    setIsDeleting(true);
    try {
      const result = await adminService.clearTestOrders();
      toast.success(`Purged ${result?.count || detectedFakeOrders.length} fake & test orders`);
      setIsClearFakeModalOpen(false);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to clear fake orders');
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear All Orders (Clean Slate)
  const handleClearAllOrders = async () => {
    setIsDeleting(true);
    try {
      const result = await adminService.clearAllOrders();
      toast.success(`Wiped ${result?.count || orders.length} orders. Store is ready for real customers!`);
      setIsClearAllModalOpen(false);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to clear all orders');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Status Update for Selected
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        await adminService.updateOrderStatus(id, newStatus);
      }
      toast.success(`Updated ${selectedIds.length} orders to ${newStatus}`);
      setSelectedIds([]);
    } catch {
      toast.error('Failed to update status for selected orders');
    }
  };

  // Checkbox Selection Logic
  const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.includes(o.id));
  const someFilteredSelected = filteredOrders.some(o => selectedIds.includes(o.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredOrders.some(o => o.id === id)));
    } else {
      const newIds = new Set([...selectedIds, ...filteredOrders.map(o => o.id)]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Draft Form Handlers
  const addProductToDraft = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setDraftForm(prev => {
      const existing = prev.items.find(item => item.id === product.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            quantity: 1,
            variant: (product.variants && product.variants[0]) || 'Standard',
            image: product.image || (product.images && product.images[0]) || '',
          }
        ]
      };
    });
  };

  const addCustomItemToDraft = () => {
    setDraftForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `custom_${Date.now()}`,
          title: 'Custom Product / Service',
          price: 999,
          quantity: 1,
          variant: 'Standard',
        }
      ]
    }));
  };

  const updateDraftItem = (index: number, updates: Partial<OrderItem>) => {
    setDraftForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, ...updates } : item)
    }));
  };

  const removeDraftItem = (index: number) => {
    setDraftForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const draftSubtotal = useMemo(() => {
    return draftForm.items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }, [draftForm.items]);

  const draftFinalTotal = useMemo(() => {
    return Math.max(0, draftSubtotal - (Number(draftForm.discountAmount) || 0) + (Number(draftForm.shippingFee) || 0));
  }, [draftSubtotal, draftForm.discountAmount, draftForm.shippingFee]);

  const handleSaveDraftOrder = async (targetStatus: 'Draft' | 'Pending') => {
    if (!draftForm.customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (draftForm.items.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    try {
      const formattedAddress = `${draftForm.address.trim()}${draftForm.city ? `, ${draftForm.city}` : ''}${draftForm.state ? `, ${draftForm.state}` : ''}${draftForm.pincode ? ` - ${draftForm.pincode}` : ''}, India`;

      await adminService.createDraftOrder({
        customer: {
          name: draftForm.customerName.trim(),
          email: draftForm.customerEmail.trim() || 'customer@store.com',
          phone: draftForm.customerPhone.trim() || '9999999999',
          address: formattedAddress,
        },
        items: draftForm.items,
        subtotal: draftSubtotal,
        discountTotal: Number(draftForm.discountAmount) || 0,
        shippingFee: Number(draftForm.shippingFee) || 0,
        total: draftFinalTotal,
        paymentMethod: draftForm.paymentMethod,
        paymentStatus: draftForm.paymentStatus,
        status: targetStatus,
        notes: draftForm.notes,
        isDraft: targetStatus === 'Draft',
      });

      toast.success(targetStatus === 'Draft' ? 'Draft order created successfully' : 'Active order created successfully');
      setIsDraftModalOpen(false);

      // Reset form
      setDraftForm({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        notes: '',
        paymentMethod: 'Manual Draft',
        paymentStatus: 'Pending',
        status: 'Draft',
        discountAmount: 0,
        shippingFee: 0,
        items: [],
      });
    } catch {
      toast.error('Failed to create draft order');
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
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Orders Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">
            Track transactions, manage drafts, and clean test orders.
          </p>
        </div>

        {/* Global Order Buttons: Draft & Cleanup */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Create Draft Order Button */}
          <Button 
            onClick={() => setIsDraftModalOpen(true)}
            className="rounded-xl font-bold uppercase tracking-wider text-xs h-10 px-4 bg-[#0c2340] hover:bg-[#14325a] text-white flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FilePlus className="h-4 w-4" />
            <span>Create Draft Order</span>
          </Button>

          {/* Purge Test / Fake Orders Button */}
          {detectedFakeOrders.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsClearFakeModalOpen(true)}
              className="rounded-xl font-bold uppercase tracking-wider text-xs h-10 px-3.5 border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 flex items-center gap-1.5 cursor-pointer"
              title="Quickly remove test, sample, and dummy orders"
            >
              <Trash2 className="h-3.5 w-3.5 text-amber-700" />
              <span>Purge Test Orders ({detectedFakeOrders.length})</span>
            </Button>
          )}

          {/* Danger Zone: Clear All Orders */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-muted/80 text-muted-foreground"
                title="More bulk actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-card/95 backdrop-blur-xl">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60 p-2">
                Database Maintenance
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setIsClearFakeModalOpen(true)}
                className="rounded-lg py-2 cursor-pointer text-amber-700"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Clear Fake / Demo Orders
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsClearAllModalOpen(true)}
                className="rounded-lg py-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Wipe All Orders (Fresh Store)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="text-lg font-black tracking-tight">{counts.all}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Drafts</p>
              <p className="text-lg font-black tracking-tight">{counts.drafts}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pending</p>
              <p className="text-lg font-black tracking-tight">{counts.pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Shipped</p>
              <p className="text-lg font-black tracking-tight">{counts.shipped}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Delivered</p>
              <p className="text-lg font-black tracking-tight">{counts.delivered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#0c2340] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </div>
            <span className="text-xs font-semibold">
              {selectedIds.length} order(s) selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkStatusUpdate('Shipped')}
              className="h-8 text-xs font-semibold rounded-lg"
            >
              <Truck className="h-3.5 w-3.5 mr-1" /> Mark Shipped
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleBulkStatusUpdate('Delivered')}
              className="h-8 text-xs font-semibold rounded-lg"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Delivered
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="h-8 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              {isDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="h-8 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Main Orders Table Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4 space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 group max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Find orders, customers, phone, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl bg-background border-border/50 h-10 w-full focus-visible:ring-primary/20 text-xs"
              />
            </div>

            {/* Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
              <TabsList className="bg-muted/60 p-1 rounded-xl h-10 border border-border/50 flex flex-wrap max-w-full overflow-x-auto">
                <TabsTrigger value="ALL" className="rounded-lg text-[11px] font-bold uppercase tracking-wider px-3">
                  All ({counts.all})
                </TabsTrigger>
                <TabsTrigger value="DRAFT" className="rounded-lg text-[11px] font-bold uppercase tracking-wider px-3 text-purple-600">
                  Drafts ({counts.drafts})
                </TabsTrigger>
                <TabsTrigger value="PENDING" className="rounded-lg text-[11px] font-bold uppercase tracking-wider px-3 text-amber-600">
                  Pending ({counts.pending})
                </TabsTrigger>
                <TabsTrigger value="SHIPPED" className="rounded-lg text-[11px] font-bold uppercase tracking-wider px-3">
                  Shipped ({counts.shipped})
                </TabsTrigger>
                <TabsTrigger value="DELIVERED" className="rounded-lg text-[11px] font-bold uppercase tracking-wider px-3 text-emerald-600">
                  Delivered ({counts.delivered})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[48px] py-4 pl-4">
                  <Checkbox 
                    checked={allFilteredSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all orders"
                  />
                </TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">ID</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Customer</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Status</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Payment</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right">Total</TableHead>
                <TableHead className="w-[80px] py-4 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                    No orders match your filter criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedIds.includes(order.id);
                  const isDraft = order.status === 'Draft' || order.isDraft === true;

                  return (
                    <TableRow 
                      key={order.id} 
                      className={`group hover:bg-muted/30 border-border/50 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <TableCell className="py-4 pl-4">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectRow(order.id)}
                          aria-label={`Select order ${order.id}`}
                        />
                      </TableCell>

                      {/* Order Short ID */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-zinc-900">
                            #{order.shortId || order.id.substring(0, 6)}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {order.createdAt?.seconds 
                            ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : 'Recent'}
                        </div>
                      </TableCell>

                      {/* Customer Info */}
                      <TableCell className="py-4">
                        <div className="font-bold text-sm tracking-tight text-zinc-900">
                          {order.customer?.name || 'Customer'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {order.customer?.phone ? `+91 ${order.customer.phone}` : order.customer?.email || 'No contact'}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        {getStatusBadge(order.status, isDraft)}
                      </TableCell>

                      {/* Payment Details */}
                      <TableCell className="py-4">
                        <div className="text-xs font-bold text-zinc-900">
                          {order.paymentMethod || 'Razorpay / Online'}
                        </div>
                        {order.razorpay?.paymentId && (
                          <div className="font-mono text-[10px] text-blue-600 font-semibold mt-0.5">
                            RZP: {order.razorpay.paymentId}
                          </div>
                        )}
                        {order.paymentStatus === 'PAID' && (
                          <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            PAID
                          </span>
                        )}
                      </TableCell>

                      {/* Order Total */}
                      <TableCell className="py-4 text-right">
                        <div className="text-sm font-black tracking-tight italic text-zinc-900">
                          ₹{Number(order.total || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground">
                          {(order.items || []).length} item(s)
                        </div>
                      </TableCell>

                      {/* Row Action Dropdown */}
                      <TableCell className="py-4 pr-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0 border border-transparent hover:border-border/50 hover:bg-muted/50 rounded-lg cursor-pointer"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-card/95 backdrop-blur-xl">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60 p-2">
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem 
                                className="rounded-lg py-2 cursor-pointer"
                                onClick={() => setSelectedOrderDetails(order)}
                              >
                                <Eye className="mr-2 h-4 w-4 opacity-60" /> View Order Details
                              </DropdownMenuItem>

                              {/* If Draft, offer quick conversion */}
                              {isDraft && (
                                <DropdownMenuItem 
                                  className="rounded-lg py-2 cursor-pointer text-emerald-600 font-medium"
                                  onClick={() => handleUpdateStatus(order.id, 'Pending')}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" /> Convert to Active Order
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem 
                                className="rounded-lg py-2 cursor-pointer" 
                                onClick={() => handleUpdateStatus(order.id, 'Shipped')}
                              >
                                <Truck className="mr-2 h-4 w-4 opacity-60" /> Mark as Shipped
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                className="rounded-lg py-2 cursor-pointer" 
                                onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4 opacity-60" /> Mark as Delivered
                              </DropdownMenuItem>

                              <DropdownMenuItem 
                                className="rounded-lg py-2 cursor-pointer text-amber-700"
                                onClick={() => handleUpdateStatus(order.id, 'Cancelled')}
                              >
                                <XCircle className="mr-2 h-4 w-4 opacity-60" /> Mark as Cancelled
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem 
                                className="rounded-lg py-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 font-bold"
                                onClick={() => handleDeleteSingleOrder(order.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* DIALOG 1: CREATE DRAFT ORDER MODAL */}
      {/* ========================================================= */}
      <Dialog open={isDraftModalOpen} onOpenChange={setIsDraftModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FilePlus className="h-5 w-5 text-primary" /> Create Draft Order
            </DialogTitle>
            <DialogDescription className="text-xs">
              Manually generate an order for telephone, WhatsApp, or direct custom sales.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 1. Customer Details */}
            <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] font-semibold">Full Name *</Label>
                  <Input 
                    value={draftForm.customerName}
                    onChange={(e) => setDraftForm({ ...draftForm, customerName: e.target.value })}
                    placeholder="e.g. Ramesh Sharma"
                    className="h-9 rounded-xl text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Phone Number</Label>
                  <Input 
                    value={draftForm.customerPhone}
                    onChange={(e) => setDraftForm({ ...draftForm, customerPhone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="h-9 rounded-xl text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Email Address</Label>
                  <Input 
                    value={draftForm.customerEmail}
                    onChange={(e) => setDraftForm({ ...draftForm, customerEmail: e.target.value })}
                    placeholder="customer@email.com"
                    className="h-9 rounded-xl text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">Payment Method</Label>
                  <select
                    value={draftForm.paymentMethod}
                    onChange={(e) => setDraftForm({ ...draftForm, paymentMethod: e.target.value })}
                    className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs mt-1"
                  >
                    <option value="Manual Draft">Manual Draft</option>
                    <option value="Razorpay Standard Checkout">Razorpay</option>
                    <option value="Cash on Delivery (COD)">Cash on Delivery</option>
                    <option value="Direct UPI">Direct UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="sm:col-span-3">
                  <Label className="text-[11px] font-semibold">Delivery Address</Label>
                  <Input 
                    value={draftForm.address}
                    onChange={(e) => setDraftForm({ ...draftForm, address: e.target.value })}
                    placeholder="House / Flat / Street address"
                    className="h-9 rounded-xl text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">City</Label>
                  <Input 
                    value={draftForm.city}
                    onChange={(e) => setDraftForm({ ...draftForm, city: e.target.value })}
                    placeholder="City"
                    className="h-9 rounded-xl text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">State</Label>
                  <Input 
                    value={draftForm.state}
                    onChange={(e) => setDraftForm({ ...draftForm, state: e.target.value })}
                    placeholder="State"
                    className="h-9 rounded-xl text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[11px] font-semibold">PIN Code</Label>
                  <Input 
                    value={draftForm.pincode}
                    onChange={(e) => setDraftForm({ ...draftForm, pincode: e.target.value })}
                    placeholder="6-digit PIN"
                    className="h-9 rounded-xl text-xs mt-1"
                  />
                </div>
              </div>
            </div>

            {/* 2. Order Line Items */}
            <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border/40">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Order Items ({draftForm.items.length})
                </h3>
                <div className="flex items-center gap-2">
                  {/* Select product from catalog */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addProductToDraft(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-[11px]"
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add Store Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} - ₹{p.price}
                      </option>
                    ))}
                  </select>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addCustomItemToDraft}
                    className="h-8 text-[11px] rounded-lg"
                  >
                    + Custom Item
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {draftForm.items.length === 0 ? (
                <div className="p-6 border border-dashed border-border/80 rounded-xl text-center text-xs text-muted-foreground">
                  No items added yet. Click &quot;Add Store Product&quot; above to select from your catalog.
                </div>
              ) : (
                <div className="space-y-2">
                  {draftForm.items.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="p-3 bg-background rounded-xl border border-border/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <Input
                          value={item.title}
                          onChange={(e) => updateDraftItem(index, { title: e.target.value })}
                          className="h-8 text-xs font-bold border-0 bg-transparent p-0 focus-visible:ring-0"
                          placeholder="Item Name"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground text-[11px]">₹</span>
                        <Input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateDraftItem(index, { price: Number(e.target.value) || 0 })}
                          className="h-8 w-20 text-xs text-right"
                        />
                        <span className="text-muted-foreground text-[11px]">×</span>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateDraftItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                          className="h-8 w-14 text-xs text-center"
                        />
                        <span className="font-bold w-16 text-right">
                          ₹{item.price * item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDraftItem(index)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-md"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Pricing Summary & Adjustments */}
            <div className="p-4 bg-muted/20 rounded-2xl border border-border/40 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold text-foreground">₹{draftSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Discount (₹):</span>
                <Input
                  type="number"
                  min="0"
                  value={draftForm.discountAmount}
                  onChange={(e) => setDraftForm({ ...draftForm, discountAmount: Number(e.target.value) || 0 })}
                  className="h-7 w-24 text-right text-xs"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping Fee (₹):</span>
                <Input
                  type="number"
                  min="0"
                  value={draftForm.shippingFee}
                  onChange={(e) => setDraftForm({ ...draftForm, shippingFee: Number(e.target.value) || 0 })}
                  className="h-7 w-24 text-right text-xs"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-border/60">
                <span>Final Order Total:</span>
                <span className="font-mono text-base text-primary">₹{draftFinalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDraftModalOpen(false)}
              className="rounded-xl h-10 w-full sm:w-auto text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleSaveDraftOrder('Draft')}
              className="rounded-xl h-10 w-full sm:w-auto text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSaveDraftOrder('Pending')}
              className="rounded-xl h-10 w-full sm:w-auto text-xs font-bold bg-[#0c2340] hover:bg-[#14325a] text-white"
            >
              Create Active Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DIALOG 2: CLEAR TEST / FAKE ORDERS CONFIRMATION */}
      {/* ========================================================= */}
      <Dialog open={isClearFakeModalOpen} onOpenChange={setIsClearFakeModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold">
              Purge Fake &amp; Test Orders?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will find and remove all mock transactions, orders created with test emails (e.g. test@, demo@), and dummy records.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1 my-2">
            <p className="font-bold">Detected Candidate Orders: {detectedFakeOrders.length}</p>
            <p className="text-[11px] text-amber-800">
              Real customer orders with authentic customer contact details will NOT be touched.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsClearFakeModalOpen(false)}
              className="rounded-xl h-10 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearFakeOrders}
              disabled={isDeleting}
              className="rounded-xl h-10 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isDeleting ? 'Purging...' : `Purge ${detectedFakeOrders.length} Test Orders`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DIALOG 3: CLEAR ALL ORDERS (COMPLETE RESET) */}
      {/* ========================================================= */}
      <Dialog open={isClearAllModalOpen} onOpenChange={setIsClearAllModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-destructive">
              Wipe All Existing Orders?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will permanently delete all {orders.length} order documents in Firestore. This is typically done before launching to start fresh with 0 orders for real customers.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-950 my-2">
            <p className="font-bold">⚠️ Warning: This action is irreversible.</p>
            <p className="text-[11px] text-red-800 mt-0.5">
              All transactions, draft orders, and test logs will be purged from the database.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsClearAllModalOpen(false)}
              className="rounded-xl h-10 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAllOrders}
              disabled={isDeleting}
              className="rounded-xl h-10 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Wiping Database...' : `Yes, Delete All ${orders.length} Orders`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* DIALOG 4: ORDER DETAILS VIEW MODAL */}
      {/* ========================================================= */}
      {selectedOrderDetails && (
        <Dialog open={Boolean(selectedOrderDetails)} onOpenChange={() => setSelectedOrderDetails(null)}>
          <DialogContent className="max-w-lg rounded-3xl p-6">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold">
                  Order #{selectedOrderDetails.shortId || selectedOrderDetails.id.substring(0, 8)}
                </DialogTitle>
                {getStatusBadge(selectedOrderDetails.status, selectedOrderDetails.isDraft)}
              </div>
              <DialogDescription className="text-xs">
                Transaction placed on{' '}
                {selectedOrderDetails.createdAt?.seconds 
                  ? new Date(selectedOrderDetails.createdAt.seconds * 1000).toLocaleString('en-IN')
                  : 'Recent'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              {/* Customer Box */}
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50 space-y-1">
                <p className="font-bold text-zinc-900">{selectedOrderDetails.customer?.name}</p>
                <p className="text-muted-foreground">{selectedOrderDetails.customer?.email}</p>
                <p className="text-muted-foreground">Phone: +91 {selectedOrderDetails.customer?.phone}</p>
                <p className="text-zinc-700 pt-1">{selectedOrderDetails.customer?.address}</p>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <p className="font-bold text-zinc-900">Items Purchased</p>
                <div className="divide-y divide-border/50 border border-border/50 rounded-xl p-2 bg-muted/10">
                  {(selectedOrderDetails.items || []).map((item: any, i: number) => (
                    <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-zinc-900">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} {item.variant ? `• ${item.variant}` : ''}</p>
                      </div>
                      <span className="font-mono font-bold">
                        ₹{(Number(item.price) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-3 bg-muted/20 rounded-xl border border-border/50 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-bold">{selectedOrderDetails.paymentMethod}</span>
                </div>
                {selectedOrderDetails.razorpay?.paymentId && (
                  <div className="flex justify-between text-blue-600 font-mono text-[11px]">
                    <span>Razorpay ID:</span>
                    <span>{selectedOrderDetails.razorpay.paymentId}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-2 border-t border-border/50">
                  <span>Total Amount:</span>
                  <span className="font-mono text-primary">₹{Number(selectedOrderDetails.total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedOrderDetails(null)}
                className="rounded-xl h-9 text-xs"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
