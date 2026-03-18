import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  increment,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { notificationService } from './notificationService';

// Helper to handle Firestore errors as per guidelines
const handleFirestoreError = (error: any, operation: string, path: string) => {
  const errInfo = {
    error: error.message || String(error),
    operationType: operation,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    }
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

// Helper to parse price string/number to a valid number
const parsePrice = (price: any): number => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const parsed = Number(String(price).replace(/[^0-9.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

export const adminService = {
  // Products
  getProducts: (callback: (products: any[]) => void) => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          price: parsePrice(data.price),
          images: Array.isArray(data.images) ? data.images : (typeof data.images === 'string' ? data.images.split(',').map((s: string) => s.trim()) : []),
          image: data.image || (Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : (typeof data.images === 'string' && data.images.length > 0 ? data.images.split(',')[0] : 'https://picsum.photos/seed/placeholder/400/500'))
        };
      });
      callback(products);
    }, (error) => handleFirestoreError(error, 'list', 'products'));
  },

  addProduct: async (product: any) => {
    try {
      const images = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? product.images.split(',').map((s: string) => s.trim()) : []);
      const normalizedProduct = {
        ...product,
        price: parsePrice(product.price),
        images,
        image: product.image || (images.length > 0 ? images[0] : 'https://picsum.photos/seed/placeholder/400/500'),
        createdAt: Timestamp.now()
      };
      return await addDoc(collection(db, 'products'), normalizedProduct);
    } catch (error) {
      handleFirestoreError(error, 'create', 'products');
    }
  },

  updateProduct: async (id: string, product: any) => {
    try {
      const images = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? product.images.split(',').map((s: string) => s.trim()) : []);
      const normalizedProduct = {
        ...product,
        price: parsePrice(product.price),
        images,
        image: product.image || (images.length > 0 ? images[0] : 'https://picsum.photos/seed/placeholder/400/500')
      };
      const docRef = doc(db, 'products', id);
      return await updateDoc(docRef, normalizedProduct);
    } catch (error) {
      handleFirestoreError(error, 'update', `products/${id}`);
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const docRef = doc(db, 'products', id);
      return await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, 'delete', `products/${id}`);
    }
  },

  getProductById: async (id: string): Promise<any> => {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const images = Array.isArray(data.images) ? data.images : (typeof data.images === 'string' ? data.images.split(',').map((s: string) => s.trim()) : []);
        return { 
          id: docSnap.id, 
          ...data,
          price: parsePrice(data.price),
          images,
          image: data.image || (images.length > 0 ? images[0] : 'https://picsum.photos/seed/placeholder/400/500')
        };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, 'get', `products/${id}`);
      return null;
    }
  },

  // Orders
  getOrders: (callback: (orders: any[]) => void) => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(orders);
    }, (error) => handleFirestoreError(error, 'list', 'orders'));
  },

  createOrder: async (order: any) => {
    try {
      // Add order
      const orderData = {
        ...order,
        status: 'Pending',
        createdAt: Timestamp.now()
      };
      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // Also add/update customer for analytics using setDoc with merge to avoid read permissions issues for guests
      const customerEmail = order.customer.email.toLowerCase();
      const customerDocRef = doc(db, 'customers', customerEmail);
      
      await setDoc(customerDocRef, {
        name: order.customer.name,
        email: customerEmail,
        phone: order.customer.phone,
        address: order.customer.address,
        totalSpent: increment(order.total),
        ordersCount: increment(1),
        lastOrder: Timestamp.now()
      }, { merge: true });

      // Send notifications
      notificationService.notifyOrderStatusUpdate({ id: orderRef.id, ...orderData });

      return orderRef;
    } catch (error) {
      handleFirestoreError(error, 'create', 'orders');
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status });

      // Fetch updated order to send notifications
      const updatedSnap = await getDoc(docRef);
      if (updatedSnap.exists()) {
        notificationService.notifyOrderStatusUpdate({ id: updatedSnap.id, ...updatedSnap.data() });
      }
      
      return true;
    } catch (error) {
      handleFirestoreError(error, 'update', `orders/${id}`);
    }
  },

  getOrderByTrackingId: async (orderId: string, email: string) => {
    try {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.customer.email.toLowerCase() === email.toLowerCase()) {
          return { id: docSnap.id, ...data };
        }
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, 'get', `orders/${orderId}`);
    }
  },

  // Customers
  getCustomers: (callback: (customers: any[]) => void) => {
    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(customers);
    }, (error) => handleFirestoreError(error, 'list', 'customers'));
  },

  // Settings
  getSettings: async () => {
    try {
      const docRef = doc(db, 'settings', 'store');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, 'get', 'settings/store');
    }
  },

  updateSettings: async (settings: any) => {
    try {
      const docRef = doc(db, 'settings', 'store');
      return await updateDoc(docRef, settings);
    } catch (error) {
      handleFirestoreError(error, 'update', 'settings/store');
    }
  }
};
