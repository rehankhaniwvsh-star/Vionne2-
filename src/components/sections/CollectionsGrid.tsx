import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { adminService } from '../../services/adminService';
import { Product } from '../../constants';

export const CollectionsGrid: React.FC = () => {
  const [collections, setCollections] = useState<{ name: string; image: string }[]>([]);

  useEffect(() => {
    const unsubscribe = adminService.getProducts((products) => {
      const categories = Array.from(new Set(products.map((p: any) => p.category)));
      const dynamicCollections = categories.map(cat => {
        const productWithImage = products.find((p: any) => p.category === cat && p.image);
        return {
          name: cat,
          image: productWithImage?.image || 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800'
        };
      });
      setCollections(dynamicCollections);
    });
    return () => unsubscribe();
  }, []);

  if (collections.length === 0) return null;

  return (
    <section className="py-24 bg-[#F5F5F0]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-2 block">Explore</span>
          <h2 className="text-3xl md:text-4xl font-serif tracking-tight">Shop by Collection</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <motion.div 
              key={collection.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="group relative aspect-[4/5] overflow-hidden cursor-pointer"
            >
              <img 
                src={collection.image} 
                alt={collection.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                <h3 className="text-3xl font-serif tracking-tight mb-4">{collection.name}</h3>
                <span className="text-xs font-bold uppercase tracking-widest border-b border-white pb-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  View Collection
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
