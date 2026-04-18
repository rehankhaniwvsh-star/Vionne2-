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
  ChevronRight,
  Upload,
  FileText
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

const ProductForm = ({ product, onCancel, onSave }: any) => {
  const [formData, setFormData] = React.useState({
    title: product?.title || '',
    price: product?.price?.toString() || '0',
    inventory: product?.inventory || 0,
    category: product?.category || 'Accessories',
    status: product?.status || 'Active',
    image: product?.image || 'https://picsum.photos/seed/new/200/200',
    images: Array.isArray(product?.images) ? product.images : [],
    description: product?.description || '',
    variants: Array.isArray(product?.variants) ? product.variants : ['Default']
  });

  const [imagesText, setImagesText] = React.useState(formData.images?.join('\n') || '');
  const [variantsText, setVariantsText] = React.useState(formData.variants?.join(', ') || 'Default');
  const [newImageUrl, setNewImageUrl] = React.useState('');
  const [isBulkAdding, setIsBulkAdding] = React.useState(false);
  const [bulkImagesText, setBulkImagesText] = React.useState('');

  const addImage = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      const newImages = [...formData.images, newImageUrl];
      setFormData({
        ...formData, 
        images: newImages,
        image: formData.image || newImageUrl // Set as main if none exists
      });
      setImagesText(newImages.join('\n'));
      setNewImageUrl('');
    }
  };

  const handleBulkAdd = () => {
    const urls = bulkImagesText
      .split(/[\n,]/)
      .map(url => url.trim())
      .filter(url => url && url.startsWith('http') && !formData.images.includes(url));
    
    if (urls.length > 0) {
      const newImages = [...formData.images, ...urls];
      setFormData({
        ...formData,
        images: newImages,
        image: formData.image || urls[0]
      });
      setImagesText(newImages.join('\n'));
      setBulkImagesText('');
      setIsBulkAdding(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (!formData.images.includes(base64String)) {
          setFormData((prev: any) => {
            const newImages = [...prev.images, base64String];
            return {
              ...prev,
              images: newImages,
              image: prev.image || base64String
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (url: string) => {
    const newImages = formData.images.filter((img: string) => img !== url);
    setFormData({
      ...formData,
      images: newImages,
      image: formData.image === url ? (newImages[0] || '') : formData.image
    });
    setImagesText(newImages.join('\n'));
  };

  const setMainImage = (url: string) => {
    setFormData({ ...formData, image: url });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-xl max-w-3xl mx-auto w-full max-h-[90vh] overflow-y-auto"
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
              type="text" 
              value={formData.price}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow numbers and one decimal point
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData({...formData, price: value});
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors"
              placeholder="0.00"
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Product Gallery</label>
            <div className="flex gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors flex items-center gap-2">
                <Upload size={12} />
                Upload Files
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </label>
              <button 
                type="button"
                onClick={() => setIsBulkAdding(!isBulkAdding)}
                className="px-3 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors flex items-center gap-2"
              >
                <FileText size={12} />
                Bulk Add URLs
              </button>
            </div>
          </div>

          {isBulkAdding && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100"
            >
              <p className="text-[10px] text-zinc-500 font-medium">Paste multiple image URLs separated by commas or new lines.</p>
              <textarea 
                value={bulkImagesText}
                onChange={(e) => setBulkImagesText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors min-h-[100px] text-sm font-mono"
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg..."
              />
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsBulkAdding(false)}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleBulkAdd}
                  className="px-4 py-2 bg-black text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800"
                >
                  Add All
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(formData.images || []).map((url: string, index: number) => (
              <div key={index} className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                <img 
                  src={url} 
                  alt={`Product ${index}`} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setMainImage(url)}
                    className={`p-2 rounded-lg transition-colors ${formData.image === url ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-zinc-100'}`}
                    title="Set as Main Image"
                  >
                    <ImageIcon size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => removeImage(url)}
                    className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {formData.image === url && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
                    Main
                  </div>
                )}
              </div>
            ))}
            <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center p-4 text-center hover:border-zinc-400 transition-colors cursor-pointer group bg-zinc-50/50">
              <ImageIcon size={24} className="text-zinc-300 group-hover:text-zinc-400 mb-2" />
              <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Add via URL below</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input 
                type="text" 
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste image URL from CSV or web..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors text-sm"
              />
            </div>
            <button 
              type="button"
              onClick={addImage}
              className="px-6 py-3 bg-zinc-100 text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              Add Image
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="pt-6 flex gap-4 sticky bottom-0 bg-white pb-2">
          <button 
            onClick={() => {
              const finalData = {
                ...formData,
                price: parseFloat(formData.price) || 0
              };
              onSave(finalData);
            }}
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

export const Products = () => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingProduct, setEditingProduct] = React.useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [productToDelete, setProductToDelete] = React.useState<string | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importText, setImportText] = React.useState('');

  const handleCSVImport = async () => {
    const lines = importText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const productsToImport = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const product: any = {};
      headers.forEach((header, index) => {
        if (header === 'price' || header === 'inventory') {
          product[header] = parseFloat(values[index]) || 0;
        } else if (header === 'images') {
          product[header] = values[index] ? values[index].split('|').map(s => s.trim()) : [];
        } else if (header === 'variants') {
          product[header] = values[index] ? values[index].split('|').map(s => s.trim()) : ['Default'];
        } else {
          product[header] = values[index];
        }
      });
      
      // Defaults
      if (!product.status) product.status = 'Active';
      if (!product.category) product.category = 'Accessories';
      if (!product.images) product.images = [];
      if (!product.image && product.images.length > 0) product.image = product.images[0];
      
      return product;
    });

    for (const product of productsToImport) {
      await adminService.addProduct(product);
    }

    setIsImporting(false);
    setImportText('');
  };

  React.useEffect(() => {
    if (!adminService) {
      console.error('adminService is not loaded');
      setError('Admin service failed to initialize.');
      setLoading(false);
      return;
    }
    try {
      const unsubscribe = adminService.getProducts(
        (fetchedProducts) => {
          setProducts(Array.isArray(fetchedProducts) ? fetchedProducts : []);
          setLoading(false);
          setError(null);
        },
        (err: any) => {
          console.error('onSnapshot error in Products:', err);
          setError(err.message || 'Database connection error.');
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (err: any) {
      console.error('Failed to subscribe to products:', err);
      setError(err.message || 'Failed to load products.');
      setLoading(false);
    }
  }, []);

  const filteredProducts = products.filter(p => {
    const title = p.title || '';
    const category = p.category || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await adminService.deleteProduct(productToDelete);
        setProductToDelete(null);
      } catch (err: any) {
        console.error('Failed to delete product:', err);
        let msg = 'Failed to delete product.';
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) msg = parsed.error;
        } catch (e) {}
        alert(msg);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-400 animate-pulse uppercase tracking-widest text-xs font-bold">Loading Products...</p>
      </div>
    );
  }

  if (error) {
    let displayError = error;
    try {
      const parsed = JSON.parse(error);
      if (parsed.error) displayError = parsed.error;
    } catch (e) {}

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
          <X size={32} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Failed to Load Products</h3>
          <p className="text-zinc-500 text-sm max-w-md">{displayError}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-zinc-400 mt-1">Manage your inventory and product listings.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImporting(true)}
            className="flex items-center gap-2 bg-white border border-zinc-100 text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-50 transition-all shadow-sm"
          >
            <Upload size={20} />
            Import CSV
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isImporting && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-2xl max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Import Products from CSV</h3>
                <button onClick={() => setIsImporting(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <p className="text-zinc-500 text-sm mb-4">
                Paste your CSV data below. Headers should include: <strong>title, price, inventory, category, description, images, variants</strong>.
                Use <strong>|</strong> to separate multiple images or variants.
              </p>
              <textarea 
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors min-h-[300px] text-xs font-mono mb-6"
                placeholder="title,price,inventory,category,description,images,variants&#10;Minimalist Watch,1200,50,Accessories,A sleek watch,https://img1.jpg|https://img2.jpg,Silver|Black"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsImporting(false)}
                  className="flex-1 py-3 rounded-xl border border-zinc-100 font-bold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCSVImport}
                  disabled={!importText.trim()}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Import Products
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                try {
                  if (editingProduct) {
                    await adminService.updateProduct(editingProduct.id, data);
                  } else {
                    await adminService.addProduct(data);
                  }
                  setIsAdding(false);
                  setEditingProduct(null);
                } catch (err: any) {
                  console.error('Failed to save product:', err);
                  let msg = 'Failed to save product.';
                  try {
                    const parsed = JSON.parse(err.message);
                    if (parsed.error) msg = parsed.error;
                  } catch (e) {}
                  alert(msg);
                }
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
                  <td className="px-6 py-4 font-bold text-sm">₹{(Number(product.price) || 0).toLocaleString('en-IN')}</td>
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
