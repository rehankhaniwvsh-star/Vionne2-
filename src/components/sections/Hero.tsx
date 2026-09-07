import React from 'react';
import { motion } from 'motion/react';

interface HeroProps {
  onShopNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow }) => {
  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden bg-[#faf9f6]">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=2000" 
          alt="Modern Minimalist Living" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent md:max-w-3xl" />
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-zinc-900"
        >
          <span className="text-xs font-medium uppercase tracking-[0.25em] mb-4 block text-zinc-500">
            Autumn / Winter '26 Collection
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight leading-[1.08] mb-6 text-zinc-950">
            Simplicity in every detail.
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 mb-8 max-w-md leading-relaxed font-light">
            Thoughtfully curated functional tools designed to bring quiet beauty and modern ease into your home.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <button 
              onClick={() => {
                const el = document.getElementById('featured-products');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onShopNow();
              }}
              className="bg-[#28402c] text-white px-8 py-3.5 text-xs font-medium uppercase tracking-widest hover:bg-[#1e3021] transition-all duration-300 rounded-md shadow-sm"
            >
              Explore Collection
            </button>
            <span className="text-xs text-zinc-500 font-light">
              Free nationwide delivery on all orders
            </span>
          </div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center space-y-2 opacity-50 text-zinc-700">
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-[1px] h-10 bg-zinc-400 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 40] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-zinc-900"
          />
        </div>
      </div>
    </section>
  );
};
