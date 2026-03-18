import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Interior Designer",
      text: "Vionne has become my go-to for minimalist decor. The quality of the ceramic pieces is exceptional, and the customer service is truly premium.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Architect",
      text: "The aesthetic of these products is perfectly aligned with modern architectural principles. Clean lines, honest materials, and beautiful finishes.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Homeowner",
      text: "I was skeptical about dropshipping stores, but Vionne is different. The packaging was beautiful and the product exceeded my expectations.",
      rating: 5
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40 mb-2 block">Feedback</span>
          <h2 className="text-3xl md:text-4xl font-serif tracking-tight">What Our Clients Say</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-[#F5F5F0] rounded-2xl space-y-6"
            >
              <div className="flex space-x-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-black text-black" />
                ))}
              </div>
              <p className="text-lg font-serif italic text-black/80 leading-relaxed">"{t.text}"</p>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest">{t.name}</h4>
                <p className="text-xs text-black/40">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
