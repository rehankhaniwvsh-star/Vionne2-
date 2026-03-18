import React from 'react';
import { 
  Globe, 
  CreditCard, 
  Bell, 
  Shield, 
  Save, 
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const Settings = () => {
  const [activeTab, setActiveTab] = React.useState('website');
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const tabs = [
    { id: 'website', label: 'Website Control', icon: Globe },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-zinc-400 mt-1">Manage your store configuration and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : showSuccess ? (
            <Check size={20} />
          ) : (
            <Save size={20} />
          )}
          {isSaving ? 'Saving...' : showSuccess ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-black text-white shadow-lg shadow-black/10' 
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-grow bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
          {activeTab === 'website' && (
            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Homepage Content</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Hero Headline</label>
                    <input 
                      type="text" 
                      defaultValue="Elevate Your Everyday"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Hero Subtext</label>
                    <textarea 
                      defaultValue="Premium products curated for modern living. Discover the minimalist collection designed for those who appreciate the finer details."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-black outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold">Hero Image</h3>
                <div className="relative group cursor-pointer">
                  <div className="aspect-video rounded-2xl overflow-hidden border border-zinc-100">
                    <img 
                      src="https://picsum.photos/seed/hero/1200/600" 
                      alt="Hero" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm font-bold">
                      <ImageIcon size={18} />
                      Change Image
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Payment Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 border border-zinc-100 rounded-2xl hover:border-black transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-50 rounded-xl text-zinc-600 group-hover:bg-black group-hover:text-white transition-colors">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold">Cash on Delivery (COD)</h4>
                        <p className="text-xs text-zinc-400 font-medium">Enable customers to pay when they receive the order.</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-6 border border-zinc-100 rounded-2xl hover:border-black transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-50 rounded-xl text-zinc-600 group-hover:bg-black group-hover:text-white transition-colors">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold">Stripe Payments</h4>
                        <p className="text-xs text-zinc-400 font-medium">Accept credit cards and digital wallets securely.</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <AlertCircle className="text-amber-600 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Important Note</h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Changes to payment settings may affect active checkouts. Ensure your payment provider is correctly configured before enabling.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Email Notifications</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Order Confirmation', desc: 'Sent to customer when an order is placed.' },
                    { title: 'Shipping Update', desc: 'Sent when order status changes to shipped.' },
                    { title: 'Admin Alert', desc: 'Notify admin when a new order is received.' },
                    { title: 'Low Stock Alert', desc: 'Notify admin when product inventory is below 5.' },
                  ].map((notif, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border-b border-zinc-50 last:border-0">
                      <div>
                        <h4 className="text-sm font-bold">{notif.title}</h4>
                        <p className="text-xs text-zinc-400 font-medium">{notif.desc}</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={idx < 3} />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
