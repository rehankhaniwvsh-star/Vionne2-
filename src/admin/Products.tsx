import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  X,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  title: string;
  price: number;
  inventory: number;
  category: string;
  status: 'Active' | 'Draft' | 'Archived';
  image: string;
  images: string[];
  description: string;
  variants: string[];
}

import { adminService } from '../services/adminService';

export const Products = () => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingProduct, setEditingProduct] = React.useState<any | null>(null);

  const [selectedCategory, setSelectedCategory] = React.useState('All');

  React.useEffect(() => {
    const unsubscribe = adminService.getProducts((fetchedProducts) => {
      setProducts(fetchedProducts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const [productToDelete, setProductToDelete] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await adminService.deleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-400 animate-pulse uppercase tracking-widest text-xs font-bold">Loading Products...</p>
      </div>
    );
  }

  const ProductForm = ({ product, onCancel, onSave }: any) => {
    const [formData, setFormData] = React.useState(product || {
      title: '',
      price: 0,
      inventory: 0,
      category: 'Accessories',
      status: 'Active',
      image: 'https://picsum.photos/seed/new/200/200',
      images: [],
      description: '',
      variants: ['Default']
    });

    const [imagesText, setImagesText] = React.useState(formData.images?.join('\n') || '');
    const [variantsText, setVariantsText] = React.useState(formData.variants?.join(', ') || 'Default');

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-xl max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onCancel} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Product Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors"
                placeholder="e.g. Minimalist Watch"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors appearance-none"
              >
                <option>Accessories</option>
                <option>Apparel</option>
                <option>Home</option>
                <option>Lifestyle</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Price (₹)</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Inventory</label>
              <input 
                type="number" 
                value={formData.inventory}
                onChange={(e) => setFormData({...formData, inventory: parseInt(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors appearance-none"
              >
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Description (HTML allowed)</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors min-h-[100px]"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Main Image URL</label>
              <input 
                type="text" 
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Variants (comma separated)</label>
              <input 
                type="text" 
                value={variantsText}
                onChange={(e) => {
                  setVariantsText(e.target.value);
                  setFormData({...formData, variants: e.target.value.split(',').map(v => v.trim()).filter(v => v)});
                }}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Additional Image URLs (one per line)</label>
            <textarea 
              value={imagesText}
              onChange={(e) => {
                setImagesText(e.target.value);
                setFormData({...formData, images: e.target.value.split('\n').map(url => url.trim()).filter(url => url)});
              }}
              className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors min-h-[80px]"
              placeholder="https://example.com/image1.jpg"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              onClick={() => onSave(formData)}
              className="flex-grow bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <Save size={18} />
              {product ? 'Update Product' : 'Create Product'}
            </button>
            <button 
              onClick={onCancel}
              className="px-8 py-4 rounded-xl border border-zinc-100 font-bold hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-zinc-400 mt-1">Manage your inventory and product listings.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Product?</h3>
              <p className="text-zinc-500 text-sm mb-8">This action cannot be undone. All product data will be permanently removed.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-zinc-100 font-bold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isAdding || editingProduct) && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
            <ProductForm 
              product={editingProduct} 
              onCancel={() => {
                setIsAdding(false);
                setEditingProduct(null);
              }}
              onSave={async (data: any) => {
                if (editingProduct) {
                  await adminService.updateProduct(editingProduct.id, data);
                } else {
                  await adminService.addProduct(data);
                }
                setIsAdding(false);
                setEditingProduct(null);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-50 border-none outline-none focus:ring-2 focus:ring-black/5 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-zinc-100 text-sm font-bold hover:bg-zinc-50 transition-colors outline-none bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Accessories">Accessories</option>
              <option value="Apparel">Apparel</option>
              <option value="Home">Home</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200">
                        <img 
                          src={product.image || (product.images && product.images[0]) || 'https://picsum.photos/seed/placeholder/100/100'} 
                          alt={product.title} 
                          referrerPolicy="no-referrer" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="font-bold text-sm">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      product.status === 'Active' ? 'bg-emerald-50 text-emerald-600' :
                      product.status === 'Draft' ? 'bg-amber-50 text-amber-600' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${
                        product.status === 'Active' ? 'bg-emerald-500' :
                        product.status === 'Draft' ? 'bg-amber-500' : 'bg-zinc-400'
                      }`} />
                      {product.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${product.inventory === 0 ? 'text-red-500 font-bold' : 'text-zinc-600'}`}>
                      {product.inventory} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 font-medium">{product.category}</td>
                  <td className="px-6 py-4 font-bold text-sm">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-zinc-50 flex items-center justify-between">
          <p className="text-xs text-zinc-400 font-medium">Showing {filteredProducts.length} of {products.length} products</p>
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
