import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-10 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 text-center">
            <h1 className="text-5xl font-serif tracking-tight mb-6">Get in Touch</h1>
            <p className="text-black/60 max-w-xl mx-auto">
              Have a question about our products or an existing order? Our team is here to help you create your perfect space.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
              <div className="space-y-8">
                <h2 className="text-2xl font-serif tracking-tight">Contact Details</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail size={20} className="text-black/40 mt-1" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1">Email</p>
                      <p className="text-black/60">hello@vionne.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Phone size={20} className="text-black/40 mt-1" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1">Phone</p>
                      <p className="text-black/60">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <MapPin size={20} className="text-black/40 mt-1" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1">Studio</p>
                      <p className="text-black/60">123 Minimalist Way, Suite 400<br />San Francisco, CA 94103</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-[#F5F5F0] rounded-2xl">
                <h3 className="text-lg font-serif mb-4">Customer Service Hours</h3>
                <p className="text-sm text-black/60 leading-relaxed">
                  Monday — Friday: 9am – 6pm PST<br />
                  Saturday: 10am – 4pm PST<br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            <div className="bg-white border border-black/5 p-10 shadow-sm">
              <h2 className="text-2xl font-serif tracking-tight mb-8">Send a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest">First Name</label>
                    <input type="text" className="w-full border-b border-black/10 py-2 focus:border-black outline-none transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest">Last Name</label>
                    <input type="text" className="w-full border-b border-black/10 py-2 focus:border-black outline-none transition-colors" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Email Address</label>
                  <input type="email" className="w-full border-b border-black/10 py-2 focus:border-black outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Subject</label>
                  <select className="w-full border-b border-black/10 py-2 focus:border-black outline-none transition-colors bg-transparent">
                    <option>General Inquiry</option>
                    <option>Order Status</option>
                    <option>Returns & Exchanges</option>
                    <option>Press & Partnerships</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest">Message</label>
                  <textarea rows={4} className="w-full border-b border-black/10 py-2 focus:border-black outline-none transition-colors resize-none" />
                </div>
                <button className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-black/80 transition-all flex items-center justify-center space-x-3">
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
