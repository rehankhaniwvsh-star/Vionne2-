import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Use default database for manual setup

const seed = async () => {
  console.log('Seeding initial data to project:', firebaseConfig.projectId);

  // Seed Products
  const products = [
    { title: 'Minimalist Watch', price: 129.00, inventory: 45, category: 'Accessories', status: 'Active', image: 'https://picsum.photos/seed/watch/400/400', createdAt: Timestamp.now() },
    { title: 'Leather Wallet', price: 45.00, inventory: 12, category: 'Accessories', status: 'Active', image: 'https://picsum.photos/seed/wallet/400/400', createdAt: Timestamp.now() },
    { title: 'Ceramic Vase', price: 89.00, inventory: 8, category: 'Home', status: 'Draft', image: 'https://picsum.photos/seed/vase/400/400', createdAt: Timestamp.now() },
    { title: 'Cotton T-Shirt', price: 35.00, inventory: 120, category: 'Apparel', status: 'Active', image: 'https://picsum.photos/seed/shirt/400/400', createdAt: Timestamp.now() },
  ];

  for (const product of products) {
    await addDoc(collection(db, 'products'), product);
  }

  // Seed Settings
  await setDoc(doc(db, 'settings', 'store'), {
    homepage: {
      heroHeadline: "Elevate Your Everyday",
      heroSubtext: "Premium products curated for modern living. Discover the minimalist collection designed for those who appreciate the finer details.",
      heroImage: "https://picsum.photos/seed/vionne/1920/1080"
    },
    payments: {
      codEnabled: true,
      stripeEnabled: false
    },
    notifications: {
      orderConfirmation: true,
      shippingUpdate: true,
      adminAlert: true
    }
  });

  // Seed some orders
  const orders = [
    {
      customer: { name: 'Emma Watson', email: 'emma@example.com', phone: '+1 234 567 890', address: '123 Luxury Ave, Beverly Hills, CA 90210' },
      items: [{ productId: '1', title: 'Minimalist Watch', price: 129.00, quantity: 1 }],
      total: 129.00,
      status: 'Delivered',
      paymentMethod: 'Credit Card',
      createdAt: Timestamp.now()
    },
    {
      customer: { name: 'Sarah Chen', email: 'sarah@example.com', phone: '+1 555 012 345', address: '789 Zen Garden, San Francisco, CA 94105' },
      items: [{ productId: '3', title: 'Ceramic Vase', price: 89.00, quantity: 1 }],
      total: 89.00,
      status: 'Pending',
      paymentMethod: 'COD',
      createdAt: Timestamp.now()
    }
  ];

  for (const order of orders) {
    await addDoc(collection(db, 'orders'), order);
  }

  console.log('Seeding complete!');
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
