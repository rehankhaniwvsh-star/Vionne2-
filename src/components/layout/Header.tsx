import React from 'react';
import { ShoppingBag, Search, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../store/useCart';
import { cn } from '../../lib/utils';
import { auth, db } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const cartItems = useCart(state => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setIsAdmin(userDoc.data()?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    });

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact' },
    { name: 'Track Order', id: 'track-order' },
  ];

  return (
    <>
      <div className="bg-[#8f9e83] text-white py-2.5 text-center text-xs tracking-wide font-medium">
        Shop our latest arrivals
      </div>
      <header 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b",
          isScrolled ? "bg-white/95 backdrop-blur-md py-3.5 border-zinc-200/80 shadow-xs" : "bg-white py-4 border-zinc-100"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className="p-1.5 text-zinc-800 hover:text-black transition-colors"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Toggle menu"
            >
              <Menu size={20} strokeWidth={1.8} />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('featured-products');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('home');
              }}
              className="p-1.5 text-zinc-800 hover:text-black transition-colors"
              title="Search store"
            >
              <Search size={19} strokeWidth={1.8} />
            </button>
          </div>

          <button 
            onClick={() => onNavigate('home')}
            className="text-2xl md:text-3xl font-serif tracking-tight text-zinc-900 absolute left-1/2 -translate-x-1/2 font-medium hover:opacity-85 transition-opacity"
          >
            VIONNE
          </button>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <nav className="hidden lg:flex items-center space-x-6 mr-2">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={cn(
                    "text-xs tracking-wider uppercase transition-colors hover:text-black",
                    currentPage === link.id ? "text-black font-semibold" : "text-zinc-500 font-medium"
                  )}
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {isAdmin && (
              <button 
                onClick={() => onNavigate('admin')}
                className="p-1.5 text-zinc-700 hover:text-black transition-colors hidden sm:block"
                title="Admin Dashboard"
              >
                <LayoutDashboard size={19} strokeWidth={1.8} />
              </button>
            )}
            {user ? (
              <button 
                onClick={handleLogout}
                className="p-1.5 text-zinc-700 hover:text-black transition-colors"
                title="Logout"
              >
                <LogOut size={19} strokeWidth={1.8} />
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('admin')}
                className="p-1.5 text-zinc-700 hover:text-black transition-colors hidden sm:block"
                title="Account / Admin"
              >
                <svg className="w-[19px] h-[19px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}
            <button 
              onClick={() => onNavigate('cart')}
              className="p-1.5 text-zinc-800 hover:text-black transition-colors relative"
              aria-label="View Cart"
            >
              <ShoppingBag size={20} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#28402c] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 z-[100] bg-white transition-transform duration-500 md:hidden",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex justify-between items-center border-b">
          <span className="text-xl font-serif tracking-tighter">VIONNE</span>
          <button onClick={() => setIsMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col p-8 space-y-6">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setIsMenuOpen(false);
              }}
              className="text-2xl tracking-widest uppercase text-left"
            >
              {link.name}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('admin');
                setIsMenuOpen(false);
              }}
              className="text-2xl tracking-widest uppercase text-left flex items-center gap-3"
            >
              <LayoutDashboard size={24} />
              Dashboard
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="text-2xl tracking-widest uppercase text-left flex items-center gap-3 text-red-600"
            >
              <LogOut size={24} />
              Logout
            </button>
          )}
        </nav>
      </div>
    </>
  );
};
