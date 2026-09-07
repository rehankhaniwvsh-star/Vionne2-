import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Pooja Sharma",
      role: "Home Decorator",
      text: "The X4cart Touch Control LED Lamp gives the warmest, coziest bedside light. The 3 color modes and dimming are so effortless to use at night!",
      rating: 5
    },
    {
      name: "Dr. Ananya Rao",
      role: "Wellness Enthusiast",
      text: "The 2 in 1 Oil Dispenser & Sprayer is a lifesaver for healthy cooking and air frying. Controlling oil to 0.15g per mist makes macro tracking seamless.",
      rating: 5
    },
    {
      name: "Ritu Kapoor",
      role: "Architect",
      text: "The Wall-Mounted Hair Tool Organizer cleared my bathroom counter completely. It safely holds my hot blow dryer, flat iron, and brushes right after styling.",
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
