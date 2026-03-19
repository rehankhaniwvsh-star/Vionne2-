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
  total: 0,
  addItem: (product, variant) => {
    const items = get().items;
    const existingItem = items.find(item => item.id === product.id && item.selectedVariant === variant);
    
    let newItems;
    if (existingItem) {
      newItems = items.map(item => 
        item.id === product.id && item.selectedVariant === variant
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newItems = [...items, { ...product, quantity: 1, selectedVariant: variant }];
    }
    
    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
    set({ items: newItems, total: newTotal });
  },
  removeItem: (id, variant) => {
    const newItems = get().items.filter(item => !(item.id === id && item.selectedVariant === variant));
    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
    set({ items: newItems, total: newTotal });
  },
  updateQuantity: (id, variant, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id, variant);
      return;
    }
    const newItems = get().items.map(item => 
      item.id === id && item.selectedVariant === variant
        ? { ...item, quantity }
        : item
    );
    const newTotal = newItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
    set({ items: newItems, total: newTotal });
  },
  clearCart: () => set({ items: [], total: 0 }),
}));
