import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../../constants';
import { ShoppingBag } from 'lucide-react';
import { adminService } from '../../services/adminService';

interface FeaturedProductsProps {
  onProductClick: (product: Product) => void;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ onProductClick }) => {
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <p className="text-black/40 animate-pulse uppercase tracking-widest text-xs">Loading Collection...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-2 block">Curated Selection</span>
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight">Featured Products</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 4) * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onProductClick(product)}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F5F0] mb-6">
                <img 
                  src={product.image || (product.images && product.images[0]) || 'https://picsum.photos/seed/placeholder/400/500'} 
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://picsum.photos/seed/placeholder/400/500';
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                <button className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center space-x-2">
                  <ShoppingBag size={14} />
                  <span>Quick Add</span>
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-black/40">{product.category}</p>
                <h3 className="text-lg font-medium tracking-tight">{product.title}</h3>
                <p className="text-sm font-light text-black/60">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
