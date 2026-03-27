import React from 'react';
import { Instagram, Twitter, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F5F5F0] pt-20 pb-10 border-t border-black/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif tracking-tighter">VIONNE</h3>
            <p className="text-sm text-black/60 leading-relaxed max-w-xs">
              Curating premium essentials for the modern home. Minimalist design, maximum quality.
            </p>
            <div className="flex space-x-4">
              <Instagram size={20} className="text-black/60 hover:text-black cursor-pointer transition-colors" />
              <Twitter size={20} className="text-black/60 hover:text-black cursor-pointer transition-colors" />
              <Facebook size={20} className="text-black/60 hover:text-black cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-black/60">
              <li><a href="#" className="hover:text-black transition-colors">Featured Products</a></li>
              <li><a href="#" className="hover:text-black transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-black/60">
              <li><a href="#" className="hover:text-black transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-black transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Newsletter</h4>
            <p className="text-sm text-black/60 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="flex border-b border-black pb-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border-none outline-none text-sm w-full"
              />
              <button className="text-xs font-bold uppercase tracking-widest">Join</button>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-[10px] text-black/40 uppercase tracking-widest">
            © 2026 VIONNE. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <a href="/admin" className="text-[10px] text-black/40 uppercase tracking-widest hover:text-black transition-colors">Admin</a>
            <span className="text-[10px] text-black/40 uppercase tracking-widest">Visa</span>
            <span className="text-[10px] text-black/40 uppercase tracking-widest">Mastercard</span>
            <span className="text-[10px] text-black/40 uppercase tracking-widest">Amex</span>
            <span className="text-[10px] text-black/40 uppercase tracking-widest">PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
