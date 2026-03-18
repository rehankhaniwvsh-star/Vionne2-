import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Globe, 
  Settings, 
  Bell, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-black text-white shadow-lg shadow-black/10" 
        : "text-zinc-500 hover:bg-zinc-100 hover:text-black"
    )}
  >
    <span className={cn(
      "transition-transform duration-200 group-hover:scale-110",
      active ? "text-white" : "text-zinc-400 group-hover:text-black"
    )}>
      {icon}
    </span>
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/admin/login');
      } else {
        setUser(currentUser);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const navItems = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { to: '/admin/products', icon: <Package size={20} />, label: 'Products' },
    { to: '/admin/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
    { to: '/admin/customers', icon: <Users size={20} />, label: 'Customers' },
    { to: '/admin/website', icon: <Globe size={20} />, label: 'Website' },
    { to: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-zinc-200 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <span className="text-white font-serif text-xl font-bold italic">V</span>
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight">Vionne</h1>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to} 
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </nav>

        <div className="pt-6 border-t border-zinc-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-zinc-200 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-serif text-lg font-bold italic">V</span>
          </div>
          <span className="font-serif font-bold">Vionne</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-600"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="lg:hidden fixed inset-0 bg-white z-40 pt-20 p-6 flex flex-col"
          >
            <nav className="flex-grow space-y-2">
              {navItems.map((item) => (
                <NavItem 
                  key={item.to} 
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.to} 
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 bg-red-50 font-medium"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow pt-20 lg:pt-0">
        <header className="hidden lg:flex items-center justify-between px-10 py-6 bg-white border-b border-zinc-100 sticky top-0 z-30">
          <div>
            <h2 className="text-sm text-zinc-400 font-medium">Welcome back,</h2>
            <p className="text-lg font-bold">{user.displayName || 'Administrator'}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-black transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
              <img 
                src={user.photoURL || "https://picsum.photos/seed/admin/100/100"} 
                alt="Admin" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
