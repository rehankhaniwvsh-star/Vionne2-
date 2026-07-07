import React from 'react';
import { adminService } from '../../services/adminService';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye,
  ArrowUpDown,
  Circle,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function ProductsPage() {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState({
    title: '',
    price: '',
    inventory: '',
    category: 'Accessories',
    status: 'Active',
    description: ''
  });

  React.useEffect(() => {
    const unsubscribe = adminService.getProducts((fetchedProducts) => {
      setProducts(fetchedProducts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.addProduct({
        ...newProduct,
        price: Number(newProduct.price),
        inventory: Number(newProduct.inventory)
      });
      toast.success('Product added successfully');
      setIsDialogOpen(false);
      setNewProduct({
        title: '',
        price: '',
        inventory: '',
        category: 'Accessories',
        status: 'Active',
        description: ''
      });
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(id);
        toast.success('Product deleted');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg flex items-center gap-1.5"><Circle className="h-2 w-2 fill-current" /> Active</Badge>;
      case 'Draft':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 rounded-lg flex items-center gap-1.5"><Circle className="h-2 w-2 fill-current" /> Draft</Badge>;
      case 'Archived':
        return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 rounded-lg flex items-center gap-1.5"><Circle className="h-2 w-2 fill-current" /> Archived</Badge>;
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
          <h1 className="text-3xl font-black tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">Manage your inventory and store listings.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] rounded-2xl bg-card/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Add New Product</DialogTitle>
              <DialogDescription className="font-medium text-xs uppercase tracking-widest opacity-60">Create a new item in your store catalog.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct}>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Product Title</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Silk Scarf" 
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                    className="rounded-xl bg-muted/30 border-border/50 h-11" 
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Price (₹)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0.00" 
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="rounded-xl bg-muted/30 border-border/50 h-11" 
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Initial Stock</Label>
                    <Input 
                      id="stock" 
                      type="number" 
                      placeholder="0" 
                      value={newProduct.inventory}
                      onChange={(e) => setNewProduct({...newProduct, inventory: e.target.value})}
                      className="rounded-xl bg-muted/30 border-border/50 h-11" 
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Category</Label>
                  <Input 
                    id="category" 
                    placeholder="e.g. Accessories" 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="rounded-xl bg-muted/30 border-border/50 h-11" 
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="ghost" className="rounded-xl font-bold uppercase tracking-widest text-xs" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="rounded-xl bg-primary shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-xs">Save Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl bg-transparent border-border/50 h-10 w-full md:max-w-sm focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-xl border-border/50 h-10 font-bold text-xs uppercase tracking-widest">
                <Filter className="mr-2 h-3.5 w-3.5" /> Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-[80px] py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Image</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                    Product <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Status</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60">Inventory</TableHead>
                <TableHead className="py-4 text-[10px] font-black uppercase tracking-widest opacity-60 text-right">Price</TableHead>
                <TableHead className="w-[80px] py-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                    No products found
                  </TableCell>
                </TableRow>
              ) : filteredProducts.map((product) => (
                <TableRow key={product.id} className="group hover:bg-muted/30 border-border/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-border/50 bg-muted/50 transition-transform group-hover:scale-105">
                      <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="font-bold text-sm tracking-tight">{product.title}</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5">{product.category}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    {getStatusBadge(product.status)}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className={cn(
                      "text-sm font-bold tracking-tight",
                      product.inventory === 0 ? "text-destructive" : (product.inventory < 15 ? "text-amber-500" : "text-foreground")
                    )}>
                      {product.inventory}
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground">In Stock</div>
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="text-sm font-black tracking-tight italic">₹{product.price.toLocaleString('en-IN')}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 border border-transparent hover:border-border/50 hover:bg-muted/50 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 bg-card/95 backdrop-blur-xl">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest opacity-60 p-2">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg py-2 cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 opacity-60" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg py-2 cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4 opacity-60" /> Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="rounded-lg py-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4 opacity-60" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t border-border/50 flex items-center justify-between bg-muted/10">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Showing {filteredProducts.length} of {products.length} products</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
