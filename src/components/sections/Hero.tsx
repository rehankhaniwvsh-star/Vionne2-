import React from 'react';
import { motion } from 'motion/react';

interface HeroProps {
  onShopNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopNow }) => {
  return (
    <section className="relative h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=2000" 
          alt="Happy Pets" 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-white md:text-black"
        >
          <span className="text-xs font-bold uppercase tracking-[0.3em] mb-6 block">New Collection</span>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter leading-[1.1] mb-8">
            Elevate Your <br /> Everyday
          </h1>
          <p className="text-lg md:text-xl text-black/70 mb-10 max-w-md leading-relaxed">
            Premium products curated for modern living. Minimalist design meets exceptional quality.
          </p>
          <button 
            onClick={() => {
              const el = document.getElementById('featured-products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else onShopNow();
            }}
            className="bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all duration-300 transform hover:scale-105"
          >
            Shop Now
          </button>
        </motion.div>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 opacity-50">
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-[1px] h-12 bg-black/20 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 48] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-black"
          />
        </div>
      </div>
    </section>
  );
};
