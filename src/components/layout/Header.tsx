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
      <div className="bg-black text-white py-2 text-center text-xs tracking-widest uppercase">
        🚚 Free Shipping on All Orders
      </div>
      <header 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 border-b",
          isScrolled ? "bg-white/80 backdrop-blur-md py-3 border-black/5" : "bg-white py-5 border-transparent"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={cn(
                  "text-sm tracking-widest uppercase transition-colors hover:text-black/50",
                  currentPage === link.id ? "text-black font-medium" : "text-black/70"
                )}
              >
                {link.name}
              </button>
            ))}
          </nav>

          <button 
            onClick={() => onNavigate('home')}
            className="text-2xl font-serif tracking-tighter absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
          >
            VIONNE
          </button>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:text-black/50 transition-colors hidden sm:block">
              <Search size={20} />
            </button>
            {isAdmin && (
              <button 
                onClick={() => onNavigate('admin')}
                className="p-2 hover:text-black/50 transition-colors hidden sm:block"
                title="Admin Dashboard"
              >
                <LayoutDashboard size={20} />
              </button>
            )}
            {user && (
              <button 
                onClick={handleLogout}
                className="p-2 hover:text-black/50 transition-colors hidden sm:block"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            )}
            <button 
              onClick={() => onNavigate('cart')}
              className="p-2 hover:text-black/50 transition-colors relative"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
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
