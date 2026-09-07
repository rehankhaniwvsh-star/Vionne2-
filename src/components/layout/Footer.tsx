import React, { useState } from 'react';
import { Check, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#111613] text-zinc-200 pt-16 pb-10 border-t border-zinc-800">
      <div className="container mx-auto px-4 md:px-8">
        {/* Community Newsletter Section from screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end pb-14 border-b border-zinc-800/80">
          <div className="md:col-span-6 space-y-2">
            <h3 className="text-3xl md:text-4xl font-serif font-normal tracking-tight text-zinc-100">
              join our kitchen community
            </h3>
            <p className="text-xs text-zinc-400 font-light">
              Receive fresh ideas and exclusive offers weekly.
            </p>
          </div>

          <div className="md:col-span-6">
            {isSubscribed ? (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs py-2">
                <Check size={16} />
                <span>Thank you! You're on the list for our latest recipes and offers.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center border-b border-zinc-500 pb-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" 
                  required
                  className="bg-transparent border-none outline-none text-xs text-zinc-100 placeholder:text-zinc-500 w-full py-1"
                />
                <button 
                  type="submit" 
                  className="text-xs font-medium tracking-wide text-zinc-300 hover:text-white transition-colors whitespace-nowrap pl-4"
                >
                  Sign up
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-b border-zinc-800/80 text-xs text-zinc-400">
          <div className="space-y-3">
            <h4 className="font-serif text-sm text-zinc-200 font-medium">VIONNE</h4>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Thoughtfully curated kitchen and living essentials designed for effortless modern cooking.
            </p>
          </div>
          <div>
            <h5 className="text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-3">Shop</h5>
            <ul className="space-y-2.5">
              <li><a href="#featured-products" className="hover:text-white transition-colors">2-in-1 Oil Dispenser</a></li>
              <li><a href="#featured-products" className="hover:text-white transition-colors">Kitchen & Living</a></li>
              <li><a href="#featured-products" className="hover:text-white transition-colors">New Arrivals</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-3">Customer Care</h5>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-white transition-colors">Track Your Shipment</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-white transition-colors">30-Day Easy Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Warranty Claim</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[11px] uppercase tracking-wider text-zinc-300 font-semibold mb-3">Contact Us</h5>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Have questions? Our support team is available Mon-Sat, 9AM-7PM IST.<br />
              <span className="text-zinc-300">support@vionne.com</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar matching Canyon footer */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center space-x-4">
            <span className="text-zinc-400">© 2026 VIONNE. All rights reserved.</span>
            <span>•</span>
            <span className="text-zinc-400">Privacy & Terms</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              <span>🇮🇳</span>
              <span>IN ₹</span>
            </div>
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Globe size={12} />
              <span>EN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
