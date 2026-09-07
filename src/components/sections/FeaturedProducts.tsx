import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../../constants';
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
        <div className="container mx-auto px-4 md:px-8 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-xs tracking-widest uppercase">Curating collection...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium block mb-2">
            Selected Essentials
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-zinc-900">
            Thoughtfully Crafted for Everyday Living
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-12">
          {products.map((product, index) => {
            const price = Number(product.price) || 549;
            const originalPrice = product.originalPrice || Math.round(price * 1.6);
            const isSale = originalPrice > price;

            return (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
                className="group cursor-pointer flex flex-col"
                onClick={() => onProductClick(product)}
              >
                {/* Product Image Box */}
                <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100 mb-3.5">
                  <img 
                    src={product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800'} 
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800';
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  
                  {/* Clean Sale Badge */}
                  {isSale && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-[#8f9e83] text-white text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full shadow-xs">
                        Sale
                      </span>
                    </div>
                  )}
                </div>

                {/* Typography & Price */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 font-light block mb-0.5">
                      {product.category}
                    </span>
                    <h3 className="text-sm md:text-base font-normal text-zinc-900 line-clamp-2 leading-snug group-hover:text-zinc-600 transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  <div className="flex items-baseline space-x-2 pt-1">
                    <span className="text-sm md:text-base font-medium text-zinc-900">
                      Rs. {price.toLocaleString('en-IN')}.00
                    </span>
                    {originalPrice > price && (
                      <span className="text-xs text-zinc-400 line-through font-light">
                        Rs. {originalPrice.toLocaleString('en-IN')}.00
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
