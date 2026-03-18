import React from 'react';
import { motion } from 'motion/react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-10 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-24">
          <section className="text-center space-y-8">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-bold uppercase tracking-[0.4em] text-black/40 block"
            >
              Our Story
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-serif tracking-tight leading-tight"
            >
              Minimalism as a <br /> Lifestyle.
            </motion.h1>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="aspect-[4/5] bg-[#F5F5F0] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000" 
                alt="Minimalist Workspace" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-8">
              <h2 className="text-3xl font-serif tracking-tight">The Vionne Philosophy</h2>
              <p className="text-black/60 leading-relaxed text-lg">
                Founded in 2024, Vionne was born from a simple desire: to strip away the noise and focus on what truly matters. We believe that your environment profoundly impacts your well-being.
              </p>
              <p className="text-black/60 leading-relaxed">
                Our curated collection of home essentials is designed with a "less is more" approach. We source only the highest quality materials, ensuring that every piece is not just beautiful, but built to last.
              </p>
            </div>
          </section>

          <section className="py-24 border-y border-black/5 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <h3 className="text-4xl font-serif">01</h3>
              <h4 className="text-xs font-bold uppercase tracking-widest">Curation</h4>
              <p className="text-sm text-black/50">Every item is hand-selected for its design integrity and functional beauty.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-serif">02</h3>
              <h4 className="text-xs font-bold uppercase tracking-widest">Quality</h4>
              <p className="text-sm text-black/50">We partner with artisans who share our commitment to exceptional craftsmanship.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-serif">03</h3>
              <h4 className="text-xs font-bold uppercase tracking-widest">Sustainability</h4>
              <p className="text-sm text-black/50">Timeless design means fewer replacements and a smaller environmental footprint.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
