import { create } from 'zustand';
import { Product } from '../constants';

interface CartItem extends Product {
  quantity: number;
  selectedVariant: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, variant: string) => void;
  removeItem: (id: string, variant: string) => void;
  updateQuantity: (id: string, variant: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  addItem: (product, variant) => {
    const items = get().items;
    const existingItem = items.find(item => item.id === product.id && item.selectedVariant === variant);
    
    if (existingItem) {
      set({
        items: items.map(item => 
          item.id === product.id && item.selectedVariant === variant
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1, selectedVariant: variant }] });
    }
  },
  removeItem: (id, variant) => {
    set({ items: get().items.filter(item => !(item.id === id && item.selectedVariant === variant)) });
  },
  updateQuantity: (id, variant, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id, variant);
      return;
    }
    set({
      items: get().items.map(item => 
        item.id === id && item.selectedVariant === variant
          ? { ...item, quantity }
          : item
      )
    });
  },
  clearCart: () => set({ items: [] }),
  get total() {
    return get().items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      return sum + (price * item.quantity);
    }, 0);
  }
}));
