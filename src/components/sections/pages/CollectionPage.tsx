import React, { useEffect, useState } from 'react';
import { Product } from '../../../constants';
import { motion } from 'motion/react';
import { Filter, ChevronDown } from 'lucide-react';
import { adminService } from '../../../services/adminService';

interface CollectionPageProps {
  onProductClick: (product: Product) => void;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ onProductClick }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = adminService.getProducts((fetchedProducts) => {
      setProducts(fetchedProducts as Product[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-10 pb-24 flex items-center justify-center">
        <p className="text-black/40 animate-pulse uppercase tracking-widest text-xs">Loading Collection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-10 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-4">Shop All</h1>
          <p className="text-black/60 max-w-xl">
            Discover our complete collection of premium essentials, designed to bring minimalist elegance to every corner of your home.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-y border-black/5 py-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-8">
            <button className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <div className="hidden md:flex items-center space-x-6 text-xs text-black/40 uppercase tracking-widest">
              <span className="text-black font-bold">All</span>
              <button className="hover:text-black transition-colors">Furniture</button>
              <button className="hover:text-black transition-colors">Decor</button>
              <button className="hover:text-black transition-colors">Lighting</button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest">
            <span>Sort By: Featured</span>
            <ChevronDown size={14} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer"
              onClick={() => onProductClick(product)}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F5F0] mb-6">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-black/40">{product.category}</p>
                <h3 className="text-lg font-medium tracking-tight">{product.title}</h3>
                <p className="text-sm font-light text-black/60">${product.price.toFixed(2)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
