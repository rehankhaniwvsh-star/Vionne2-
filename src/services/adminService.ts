import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  writeBatch,
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
import { INITIAL_PRODUCTS, Product } from '../data/mockProducts';

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
  // Remove currency symbols, commas, and whitespace
  const cleaned = String(price).replace(/[₹$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Find fallback matching product
const getFallbackProduct = (id?: string, title?: string): Partial<Product> => {
  if (id) {
    const foundById = INITIAL_PRODUCTS.find(p => p.id === id);
    if (foundById) return foundById;
  }
  if (title) {
    const foundByTitle = INITIAL_PRODUCTS.find(p => 
      p.title.toLowerCase().includes(title.toLowerCase().substring(0, 15)) ||
      title.toLowerCase().includes(p.title.toLowerCase().substring(0, 15))
    );
    if (foundByTitle) return foundByTitle;
  }
  return INITIAL_PRODUCTS[0];
};

export const adminService = {
  // Products
  getProducts: (callback: (products: any[]) => void, onError?: (error: any) => void) => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // Fallback to initial products if firestore is empty
        callback(INITIAL_PRODUCTS);
        return;
      }
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        const fallback = getFallbackProduct(doc.id, data.title);
        const images = Array.isArray(data.images) && data.images.length > 0 
          ? data.images 
          : (typeof data.images === 'string' && data.images 
              ? data.images.split(',').map((s: string) => s.trim()) 
              : (fallback.images || ['https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=800']));
        
        return { 
          id: doc.id, 
          title: data.title || fallback.title || 'Untitled Product',
          category: data.category || fallback.category || 'Accessories',
          status: data.status || 'Active',
          inventory: Number(data.inventory) || fallback.inventory || 15,
          description: data.description || fallback.description || '',
          shortDescription: data.shortDescription || fallback.shortDescription,
          tagline: data.tagline || fallback.tagline,
          badge: data.badge || fallback.badge || 'BESTSELLER',
          rating: data.rating || fallback.rating || 4.9,
          reviewCount: data.reviewCount || fallback.reviewCount || 1280,
          originalPrice: data.originalPrice || fallback.originalPrice || (parsePrice(data.price) * 1.8),
          discountPercent: data.discountPercent || fallback.discountPercent || 45,
          variants: Array.isArray(data.variants) && data.variants.length > 0 ? data.variants : (fallback.variants || ['Default']),
          features: data.features || fallback.features || [],
          specs: data.specs || fallback.specs || [],
          boxItems: data.boxItems || fallback.boxItems || [],
          faqs: data.faqs || fallback.faqs || [],
          reviews: data.reviews || fallback.reviews || [],
          bundles: data.bundles || fallback.bundles || [],
          ...data,
          price: parsePrice(data.price) || fallback.price || 1299,
          images,
          image: data.image || images[0] || fallback.image || 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=800'
        };
      });
      callback(products);
    }, (error) => {
      console.warn('Firestore products fetch issue, falling back to mock products:', error);
      callback(INITIAL_PRODUCTS);
      if (onError) onError(error);
    });
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

  bulkAddProducts: async (
    products: any[],
    options?: { skipDuplicates?: boolean; defaultStatus?: 'Active' | 'Draft' | 'Archived' }
  ): Promise<{ added: number; skipped: number; errors: string[] }> => {
    try {
      const skipDuplicates = options?.skipDuplicates ?? true;
      const existingTitles = new Set<string>();

      if (skipDuplicates) {
        const snap = await getDocs(collection(db, 'products'));
        snap.forEach(d => {
          const t = d.data().title;
          if (t) existingTitles.add(String(t).toLowerCase().trim());
        });
      }

      let added = 0;
      let skipped = 0;
      const errors: string[] = [];

      // Process in batches of 300
      const BATCH_SIZE = 300;
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const chunk = products.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);
        let batchCount = 0;

        for (const item of chunk) {
          const title = (item.title || '').trim();
          if (!title) {
            errors.push('Skipped a product without title');
            continue;
          }

          if (skipDuplicates && existingTitles.has(title.toLowerCase())) {
            skipped++;
            continue;
          }

          const images = Array.isArray(item.images)
            ? item.images
            : (typeof item.images === 'string' && item.images
                ? item.images.split(/[,|]/).map((s: string) => s.trim()).filter(Boolean)
                : []);

          const mainImage = item.image || (images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800');
          const cleanPrice = parsePrice(item.price);
          const rawOriginalPrice = item.originalPrice ? parsePrice(item.originalPrice) : Math.round(cleanPrice * 1.5);
          const discountPercent = item.discountPercent !== undefined
            ? Number(item.discountPercent)
            : (rawOriginalPrice > cleanPrice ? Math.round(((rawOriginalPrice - cleanPrice) / rawOriginalPrice) * 100) : 30);

          const variants = Array.isArray(item.variants) && item.variants.length > 0
            ? item.variants
            : (typeof item.variants === 'string' && item.variants
                ? item.variants.split(/[|,]/).map((v: string) => v.trim()).filter(Boolean)
                : ['Standard']);

          const status = item.status && ['Active', 'Draft', 'Archived'].includes(item.status)
            ? item.status
            : (options?.defaultStatus || 'Active');

          const newDocRef = doc(collection(db, 'products'));
          batch.set(newDocRef, {
            title: title.slice(0, 200),
            price: cleanPrice,
            originalPrice: rawOriginalPrice,
            discountPercent,
            inventory: item.inventory !== undefined ? Math.max(0, Math.floor(Number(item.inventory) || 0)) : 15,
            category: (item.category || 'General').trim(),
            status,
            description: item.description || '',
            shortDescription: item.shortDescription || (item.description ? item.description.slice(0, 140) : ''),
            tagline: item.tagline || '',
            badge: item.badge || (discountPercent >= 40 ? `${discountPercent}% OFF` : 'POPULAR'),
            image: mainImage,
            images: images.length > 0 ? images : [mainImage],
            variants,
            createdAt: Timestamp.now()
          });

          if (skipDuplicates) {
            existingTitles.add(title.toLowerCase());
          }
          batchCount++;
          added++;
        }

        if (batchCount > 0) {
          await batch.commit();
        }
      }

      return { added, skipped, errors };
    } catch (error) {
      handleFirestoreError(error, 'create', 'products/bulk');
      return { added: 0, skipped: 0, errors: [String(error)] };
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
    // First check in INITIAL_PRODUCTS
    const mockFound = INITIAL_PRODUCTS.find(p => p.id === id);
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fallback = mockFound || getFallbackProduct(id, data.title);
        const images = Array.isArray(data.images) && data.images.length > 0 
          ? data.images 
          : (typeof data.images === 'string' && data.images 
              ? data.images.split(',').map((s: string) => s.trim()) 
              : (fallback.images || ['https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=800']));

        return { 
          id: docSnap.id, 
          title: data.title || fallback.title || 'Untitled Product',
          category: data.category || fallback.category || 'Accessories',
          status: data.status || 'Active',
          inventory: Number(data.inventory) || fallback.inventory || 15,
          description: data.description || fallback.description || '',
          shortDescription: data.shortDescription || fallback.shortDescription,
          tagline: data.tagline || fallback.tagline,
          badge: data.badge || fallback.badge || 'BESTSELLER',
          rating: data.rating || fallback.rating || 4.9,
          reviewCount: data.reviewCount || fallback.reviewCount || 1280,
          originalPrice: data.originalPrice || fallback.originalPrice || (parsePrice(data.price) * 1.8),
          discountPercent: data.discountPercent || fallback.discountPercent || 45,
          variants: Array.isArray(data.variants) && data.variants.length > 0 ? data.variants : (fallback.variants || ['Default']),
          features: data.features || fallback.features || [],
          specs: data.specs || fallback.specs || [],
          boxItems: data.boxItems || fallback.boxItems || [],
          faqs: data.faqs || fallback.faqs || [],
          reviews: data.reviews || fallback.reviews || [],
          bundles: data.bundles || fallback.bundles || [],
          ...data,
          price: parsePrice(data.price) || fallback.price || 1299,
          images,
          image: data.image || images[0] || fallback.image || 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=800'
        };
      }
      return mockFound || INITIAL_PRODUCTS[0];
    } catch (error) {
      console.warn('getProductById failed in Firestore, returning mock data:', error);
      return mockFound || INITIAL_PRODUCTS[0];
    }
  },

  // Orders
  getOrders: (callback: (orders: any[]) => void, onError?: (error: any) => void) => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(orders);
    }, (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, 'list', 'orders');
    });
  },

  createOrder: async (order: any) => {
    try {
      // Generate a simple numeric order ID (e.g., 100000 + random)
      const shortId = Math.floor(100000 + Math.random() * 900000).toString();

      // Add order
      const orderData = {
        ...order,
        shortId,
        total: parsePrice(order.total),
        items: order.items.map((item: any) => ({
          ...item,
          price: parsePrice(item.price)
        })),
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
      
      return { id: orderRef.id, shortId };
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

  updateOrder: async (id: string, orderData: any) => {
    try {
      const docRef = doc(db, 'orders', id);
      const normalizedOrder = {
        ...orderData,
        total: parsePrice(orderData.total),
        items: orderData.items.map((item: any) => ({
          ...item,
          price: parsePrice(item.price)
        }))
      };
      await updateDoc(docRef, normalizedOrder);
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
  getCustomers: (callback: (customers: any[]) => void, onError?: (error: any) => void) => {
    const q = query(collection(db, 'customers'), orderBy('lastOrder', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(customers);
    }, (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, 'list', 'customers');
    });
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
  },

  // Users
  getUsers: (callback: (users: any[]) => void, onError?: (error: any) => void) => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(users);
    }, (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, 'list', 'users');
    });
  },

  updateUserRole: async (uid: string, role: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      return await updateDoc(docRef, { role });
    } catch (error) {
      handleFirestoreError(error, 'update', `users/${uid}`);
    }
  },

  seedInitialData: async () => {
    try {
      const productsSnap = await getDocs(collection(db, 'products'));
      if (!productsSnap.empty) {
        return false;
      }
      
      // If empty, seed from INITIAL_PRODUCTS
      for (const product of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', product.id), {
          title: product.title,
          price: product.price,
          inventory: product.inventory || 50,
          category: product.category,
          status: product.status || 'Active',
          description: product.description,
          image: product.image,
          images: product.images,
          variants: product.variants,
          createdAt: Timestamp.now()
        }, { merge: true });
      }
      return true;
    } catch (error) {
      console.error('Seeding failed:', error);
      return false;
    }
  },

  forceResetAndSeedDropshipData: async () => {
    try {
      console.log('Starting total store reset with active products...');

      // 1. Purge all current collections
      const collectionsToPurge = ['products', 'orders', 'customers'];
      for (const colName of collectionsToPurge) {
        const snap = await getDocs(collection(db, colName));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, colName, docSnap.id));
        }
      }

      // 2. Add current active products
      for (const product of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', product.id), {
          title: product.title,
          price: product.price,
          inventory: product.inventory || 50,
          category: product.category,
          status: product.status || 'Active',
          description: product.description,
          image: product.image,
          images: product.images,
          variants: product.variants,
          createdAt: Timestamp.now()
        }, { merge: true });
      }

      // 3. Seed sample customer profiles with orders for active products
      const p1 = INITIAL_PRODUCTS[0] || { id: 'p1', title: 'Product 1', price: 499, image: '' };
      const p2 = INITIAL_PRODUCTS[1] || { id: 'p2', title: 'Product 2', price: 449, image: '' };
      const sampleOrders = [
        {
          customer: {
            name: 'Aarav Sharma',
            email: 'aarav.sharma@gmail.com',
            phone: '+91 98765 43210',
            address: 'Flat 405, Block B, Prestige Heights, Bangalore, KA - 560001'
          },
          items: [
            {
              id: p1.id,
              title: p1.title,
              price: p1.price,
              image: p1.image,
              quantity: 1,
              variant: 'Olive Green Lid (470ml)'
            }
          ],
          total: p1.price,
          status: 'Delivered',
          daysAgo: 5
        },
        {
          customer: {
            name: 'Priya Patel',
            email: 'priya.patel@gmail.com',
            phone: '+91 99887 76655',
            address: 'House 12, Sector 15, Noida, UP - 201301'
          },
          items: [
            {
              id: p2.id,
              title: p2.title,
              price: p2.price,
              image: p2.image,
              quantity: 1,
              variant: 'Clean Nordic White'
            }
          ],
          total: p2.price,
          status: 'Shipped',
          daysAgo: 2
        }
      ];

      for (const sample of sampleOrders) {
        const shortId = Math.floor(100000 + Math.random() * 900000).toString();
        const date = new Date();
        date.setDate(date.getDate() - sample.daysAgo);
        
        const orderData = {
          customer: sample.customer,
          items: sample.items,
          total: sample.total,
          status: sample.status,
          shortId,
          createdAt: Timestamp.fromDate(date)
        };

        await addDoc(collection(db, 'orders'), orderData);

        // Seed Customer stats
        const customerEmail = sample.customer.email.toLowerCase();
        const customerDocRef = doc(db, 'customers', customerEmail);
        await setDoc(customerDocRef, {
          name: sample.customer.name,
          email: customerEmail,
          phone: sample.customer.phone,
          address: sample.customer.address,
          totalSpent: increment(sample.total),
          ordersCount: increment(1),
          lastOrder: Timestamp.fromDate(date)
        }, { merge: true });
      }

      console.log('Store re-creation completed successfully!');
      return true;
    } catch (error) {
      console.error('Force reseed failed:', error);
      return false;
    }
  }
};
