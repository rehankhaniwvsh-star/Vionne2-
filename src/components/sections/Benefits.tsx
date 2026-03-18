import React from 'react';
import { Truck, CreditCard, RotateCcw, ShieldCheck } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On all orders worldwide' },
    { icon: <CreditCard size={24} />, title: 'Cash on Delivery', desc: 'Secure payment at your door' },
    { icon: <RotateCcw size={24} />, title: 'Easy Returns', desc: '30-day hassle-free returns' },
    { icon: <ShieldCheck size={24} />, title: 'Premium Quality', desc: 'Curated high-end materials' },
  ];

  return (
    <section className="py-20 border-y border-black/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center space-y-4">
              <div className="text-black/80">{benefit.icon}</div>
              <h4 className="text-xs font-bold uppercase tracking-widest">{benefit.title}</h4>
              <p className="text-sm text-black/50">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
