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
  // Remove currency symbols, commas, and whitespace
  const cleaned = String(price).replace(/[₹$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const adminService = {
  // Products
  getProducts: (callback: (products: any[]) => void, onError?: (error: any) => void) => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        const images = Array.isArray(data.images) ? data.images : (typeof data.images === 'string' ? data.images.split(',').map((s: string) => s.trim()) : []);
        return { 
          id: doc.id, 
          title: data.title || 'Untitled Product',
          category: data.category || 'Accessories',
          status: data.status || 'Active',
          inventory: Number(data.inventory) || 0,
          description: data.description || '',
          variants: Array.isArray(data.variants) ? data.variants : ['Default'],
          ...data,
          price: parsePrice(data.price),
          images,
          image: data.image || (images.length > 0 ? images[0] : 'https://picsum.photos/seed/placeholder/400/500')
        };
      });
      callback(products);
    }, (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, 'list', 'products');
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
      
      // If we have products, check if we need to purge the old templates and upgrade to dropshipping products
      let shouldSeed = false;
      if (productsSnap.empty) {
        shouldSeed = true;
      } else {
        // Look for any old product title like 'Vionne Silk Scarf' to see if this is an un-migrated store
        const hasOldProduct = productsSnap.docs.some(doc => {
          const title = doc.data().title;
          return title === 'Vionne Silk Scarf' || title === 'Minimalist Timepiece' || title === 'Leather Portfolio' || title === 'Ceramic Vase Set';
        });
        
        if (hasOldProduct) {
          console.log('Old placeholder products detected. Purging to make room for high-converting dropship products...');
          for (const docSnap of productsSnap.docs) {
            await deleteDoc(doc(db, 'products', docSnap.id));
          }
          shouldSeed = true;
        }
      }

      if (shouldSeed) {
        console.log('Seeding initial dropshipping products...');
        const initialProducts = [
          {
            title: 'AuraGlow Smart Sunset Lamp',
            price: 1499,
            inventory: 120,
            category: 'Smart Living',
            status: 'Active',
            description: 'Transform any room into a cinematic sunset oasis. Features 16 dynamic colors, adjustable brightness, and smart App/Remote control. Perfect for content creators, cozy aesthetic vibes, and bedroom upgrades.',
            image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800',
            images: [
              'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800',
              'https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=800',
              'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800'
            ],
            variants: ['Sunset Orange', 'Cosmic Purple', 'Solar Red']
          },
          {
            title: 'HydroPulse Portable Blender',
            price: 2299,
            inventory: 85,
            category: 'Wellness Tech',
            status: 'Active',
            description: 'Blend your favorite protein shakes, wellness smoothies, or fruit juices on the go. Equipped with a high-speed 6-blade stainless steel motor, USB-C rechargeable battery, and a sleek, leak-proof, self-cleaning design.',
            image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800',
            images: [
              'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800',
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800'
            ],
            variants: ['Soft Mint', 'Chalk White', 'Blush Pink']
          },
          {
            title: 'SonicVibe Sleep Mask Headphones',
            price: 1899,
            inventory: 150,
            category: 'Lifestyle',
            status: 'Active',
            description: 'Block out 100% of light and noise for deep, restorative sleep. Features ultra-thin, comfortable HD speakers embedded in a breathable, contoured memory-foam mask. Bluetooth 5.2 connectivity with 10+ hours of continuous play.',
            image: 'https://images.unsplash.com/photo-1541140111954-78af4c37ad2c?w=800',
            images: [
              'https://images.unsplash.com/photo-1541140111954-78af4c37ad2c?w=800',
              'https://images.unsplash.com/photo-1511295742364-92767fa62d9f?w=800'
            ],
            variants: ['Obsidian Black', 'Slate Gray', 'Cloud White']
          }
        ];
        
        for (const product of initialProducts) {
          await addDoc(collection(db, 'products'), {
            ...product,
            createdAt: Timestamp.now()
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Seeding failed:', error);
      return false;
    }
  },

  forceResetAndSeedDropshipData: async () => {
    try {
      console.log('Starting total store reset and dropshipping re-creation...');

      // 1. Purge all current collections
      const collectionsToPurge = ['products', 'orders', 'customers'];
      for (const colName of collectionsToPurge) {
        const snap = await getDocs(collection(db, colName));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, colName, docSnap.id));
        }
      }

      // 2. Add dropshipping products with detailed multi-category parameters
      const initialProducts = [
        {
          title: 'AuraGlow Smart Sunset Lamp',
          price: 1499,
          inventory: 120,
          category: 'Smart Living',
          status: 'Active',
          description: 'Transform any room into a cinematic sunset oasis. Features 16 dynamic colors, adjustable brightness, and smart App/Remote control. Perfect for content creators, cozy aesthetic vibes, and bedroom upgrades.',
          image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800',
          images: [
            'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800',
            'https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=800',
            'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800'
          ],
          variants: ['Sunset Orange', 'Cosmic Purple', 'Solar Red']
        },
        {
          title: 'HydroPulse Portable Blender',
          price: 2299,
          inventory: 85,
          category: 'Wellness Tech',
          status: 'Active',
          description: 'Blend your favorite protein shakes, wellness smoothies, or fruit juices on the go. Equipped with a high-speed 6-blade stainless steel motor, USB-C rechargeable battery, and a sleek, leak-proof, self-cleaning design.',
          image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800',
          images: [
            'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800',
            'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800'
          ],
          variants: ['Soft Mint', 'Chalk White', 'Blush Pink']
        },
        {
          title: 'SonicVibe Sleep Mask Headphones',
          price: 1899,
          inventory: 150,
          category: 'Lifestyle',
          status: 'Active',
          description: 'Block out 100% of light and noise for deep, restorative sleep. Features ultra-thin, comfortable HD speakers embedded in a breathable, contoured memory-foam mask. Bluetooth 5.2 connectivity with 10+ hours of continuous play.',
          image: 'https://images.unsplash.com/photo-1541140111954-78af4c37ad2c?w=800',
          images: [
            'https://images.unsplash.com/photo-1541140111954-78af4c37ad2c?w=800',
            'https://images.unsplash.com/photo-1511295742364-92767fa62d9f?w=800'
          ],
          variants: ['Obsidian Black', 'Slate Gray', 'Cloud White']
        }
      ];

      const productRefs: any[] = [];
      for (const product of initialProducts) {
        const ref = await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: Timestamp.now()
        });
        productRefs.push({ id: ref.id, ...product });
      }

      // 3. Seed 4 realistic customer profiles with realistic orders across different dates & statuses
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
              id: productRefs[0].id,
              title: productRefs[0].title,
              price: productRefs[0].price,
              image: productRefs[0].image,
              quantity: 1,
              variant: 'Sunset Orange'
            }
          ],
          total: productRefs[0].price,
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
              id: productRefs[1].id,
              title: productRefs[1].title,
              price: productRefs[1].price,
              image: productRefs[1].image,
              quantity: 1,
              variant: 'Blush Pink'
            }
          ],
          total: productRefs[1].price,
          status: 'Shipped',
          daysAgo: 2
        },
        {
          customer: {
            name: 'Rohan Das',
            email: 'rohan.das@gmail.com',
            phone: '+91 91234 56789',
            address: '56/A Gariahat Road, Kolkata, WB - 700019'
          },
          items: [
            {
              id: productRefs[2].id,
              title: productRefs[2].title,
              price: productRefs[2].price,
              image: productRefs[2].image,
              quantity: 2,
              variant: 'Obsidian Black'
            }
          ],
          total: productRefs[2].price * 2,
          status: 'Pending',
          daysAgo: 1
        },
        {
          customer: {
            name: 'Ananya Iyer',
            email: 'ananya.iyer@gmail.com',
            phone: '+91 98123 45678',
            address: 'Apt 2B, Rutland Gate 4th Street, Chennai, TN - 600006'
          },
          items: [
            {
              id: productRefs[0].id,
              title: productRefs[0].title,
              price: productRefs[0].price,
              image: productRefs[0].image,
              quantity: 1,
              variant: 'Cosmic Purple'
            },
            {
              id: productRefs[2].id,
              title: productRefs[2].title,
              price: productRefs[2].price,
              image: productRefs[2].image,
              quantity: 1,
              variant: 'Slate Gray'
            }
          ],
          total: productRefs[0].price + productRefs[2].price,
          status: 'Delivered',
          daysAgo: 10
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
