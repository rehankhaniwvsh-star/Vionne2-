export interface ProductReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  photo?: string;
}

export interface ProductBundle {
  quantity: number;
  label: string;
  price: number;
  originalPrice: number;
  discount: string;
  badge?: string;
  freeGift?: string;
}

export interface ProductFeature {
  title: string;
  desc: string;
  icon?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductFAQ {
  q: string;
  a: string;
}

export interface Product {
  id: string;
  title: string;
  tagline?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  inventory?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
  status?: string;
  badge?: string;
  description: string;
  shortDescription?: string;
  image: string;
  images: string[];
  variants: string[];
  features?: ProductFeature[];
  specs?: ProductSpec[];
  boxItems?: string[];
  faqs?: ProductFAQ[];
  reviews?: ProductReview[];
  bundles?: ProductBundle[];
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'oil-dispenser-sprayer-470ml',
    title: '2 in 1 Oil Dispenser and Oil Sprayer, 470ml Glass Bottle (Spray & Pour)',
    tagline: 'Dual Mode Glass Oil Bottle – Fine Mist Spritz (~0.15g) & Controlled Free Pour',
    price: 499,
    originalPrice: 999,
    discountPercent: 50,
    inventory: 28,
    rating: 4.9,
    reviewCount: 3120,
    category: 'Kitchen & Dining',
    status: 'Active',
    badge: 'Sale',
    shortDescription: 'One 470ml glass bottle that both pours and sprays oil! Measure roughly 0.15g per spritz for lighter, healthier cooking or tip to pour freely without drips.',
    description: `The 2 in 1 Oil Dispenser and Oil Sprayer (470ml) offers a revolutionary, space-saving kitchen solution. Switch effortlessly between an ultra-fine atomized oil mist and a smooth, controlled free pour.

• 2-in-1 Dual Function: Easily switch between a micro-atomized fine mist spray and a steady smooth pour stream.
• Healthy Cooking Oil Sprayer: Each spray dispenses approximately 0.15 grams of oil, making calorie and macro tracking effortless.
• Leak-Proof & Drip-Free: Protruding silicone-sealed nozzle and ergonomic handle keep your countertops, stoves, and cabinets clean.
• Food-Grade Lead-Free Glass: Premium borosilicate transparent glass allows you to monitor oil levels at a glance with confidence.
• Multi-Purpose Kitchen Gadget: Perfect for air fryers, BBQ grills, salads, steaks, baking, popcorn, and pan frying.
• Country of Origin: India`,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=900&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=900&auto=format&fit=crop&q=80'
    ],
    variants: ['Olive Green Lid (470ml)', 'Cream White Lid (470ml)', 'Matte Black Lid (470ml)'],
    features: [
      {
        title: '2-in-1 Dual Dispense Action',
        desc: 'Switch between micro-fine mist spray (0.15g per spritz) and a steady, drip-free pour stream.'
      },
      {
        title: 'Food-Grade Borosilicate Glass',
        desc: 'BPA-free, lead-free, crystal-clear thick glass that is durable, dishwasher-safe, and odor-free.'
      },
      {
        title: 'No-Drip Ergonomic Handle',
        desc: 'Engineered spout with internal anti-drip return channel keeps bottles and kitchen counters spotless.'
      },
      {
        title: 'Calorie & Macro Control',
        desc: 'Evenly coats pans, air fryer baskets, salads, and meats with minimal oil usage.'
      }
    ],
    specs: [
      { label: 'Material', value: 'Food-Grade Glass & BPA-Free PP' },
      { label: 'Capacity', value: '470 ml' },
      { label: 'Product Dimensions', value: '10 cm × 10 cm × 10 cm' },
      { label: 'Net Quantity', value: 'Pack of 1' },
      { label: 'Dispensing Modes', value: 'Spray (~0.15g/mist) & Free Pour' },
      { label: 'Country of Origin', value: 'India' }
    ],
    boxItems: [
      '1x 2-in-1 Glass Oil Dispenser & Sprayer Bottle (470ml)',
      '1x Sealed Anti-Leak Nozzle Cap with Trigger Handle',
      '1x User Manual & Cleaning Guide'
    ],
    bundles: [
      { quantity: 1, label: 'Single Bottle (470ml)', price: 499, originalPrice: 999, discount: '50% OFF' },
      { quantity: 2, label: 'Duo Pack (2 Bottles)', price: 899, originalPrice: 1998, discount: 'SAVE 55%', badge: 'MOST POPULAR' },
      { quantity: 3, label: 'Trio Kitchen Set (3 Bottles)', price: 1249, originalPrice: 2997, discount: 'SAVE 58%', badge: 'BEST VALUE' }
    ],
    faqs: [
      {
        q: 'Can it be used for different oils and vinegars?',
        a: 'Yes! It works great with olive oil, vegetable oil, avocado oil, sesame oil, soy sauce, and cooking vinegar.'
      },
      {
        q: 'How does the dual spray and pour feature work?',
        a: 'Press the ergonomic thumb trigger for a fine mist spray, or tilt the bottle past 45° to pour a continuous, controlled stream.'
      },
      {
        q: 'Is it easy to clean and dishwasher safe?',
        a: 'Yes, the wide mouth allows easy refill and cleaning. The glass body is dishwasher safe; hand washing the pump cap with warm soapy water is recommended.'
      }
    ],
    reviews: [
      {
        id: 'rev-oil-1',
        author: 'Priya Sharma',
        location: 'Bengaluru, KA',
        rating: 5,
        date: '2 days ago',
        title: 'Incredible for air frying & diet cooking!',
        comment: 'The mist is super fine and even. I love that I do not need two bottles for spraying and pouring. Build quality of the glass is solid.',
        verified: true
      },
      {
        id: 'rev-oil-2',
        author: 'Rajesh Varma',
        location: 'Mumbai, MH',
        rating: 5,
        date: '1 week ago',
        title: 'No leakage, very neat design',
        comment: 'Never drips on the shelf or countertop. Saves a lot of oil when making rotis, dosas, and salads. Highly recommend.',
        verified: true
      }
    ]
  },
  {
    id: 'bathroom-hair-tool-organizer-rack',
    title: 'Bathroom Hair Tool Organizer Rack – Wall Mounted Hair Dryer & Straightener Holder',
    tagline: 'Wall-Mounted Heat Resistant Styling Tool Shelf with Grooming Storage Slots',
    price: 449,
    originalPrice: 899,
    discountPercent: 50,
    inventory: 35,
    rating: 4.9,
    reviewCount: 1840,
    category: 'Home & Bathroom Organizers',
    status: 'Active',
    badge: 'Sale',
    shortDescription: 'Space-saving wall-mounted hair dryer and grooming organizer with heat-resistant compartments, brush slots, and integrated cord management hooks.',
    description: `The Space-Saving Wall-Mounted Hair Dryer Organizer Rack offers a stylish, clutter-free way to store daily grooming tools while maximizing bathroom space.

Built with heat-resistant compartments, it allows safe placement of hair dryers, straighteners, curling irons, and hot styling tools immediately after use without waiting for them to cool.

• Wall-Mounted Clutter Freeing: Eliminates counter mess and keeps your vanity organized.
• Multi-Slot Storage: Holds combs, brushes, facial sprays, razors, serums, and skincare essentials in an easy-access layout.
• Heat-Resistant Shelf: Safely cradle hot styling irons and dryers directly after styling.
• Integrated Cord & Plug Holders: Keeps tangled wires off damp countertops for safety.
• Material: High-Durability Heat-Resistant Plastic
• Product Dimensions: 10 cm × 1.5 cm × 10 cm
• Net Quantity: 1 Organizer Rack
• Country of Origin: India`,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&auto=format&fit=crop&q=80'
    ],
    variants: ['Matte Charcoal Black', 'Clean Nordic White', 'Warm Space Grey'],
    features: [
      {
        title: 'Heat-Resistant Tool Dock',
        desc: 'Safely rest hot hair dryers, curling wands, and flat irons immediately after styling.'
      },
      {
        title: 'Deep Compartment Organizer',
        desc: 'Multiple partitions neatly arrange round brushes, tail combs, hair serums, razors, and creams.'
      },
      {
        title: 'Tangle-Free Cable Management',
        desc: 'Dedicated cord holder clips wrap electric wires securely away from wet sinks.'
      },
      {
        title: 'Easy Wall Installation',
        desc: 'Supports heavy-duty traceless adhesive strip for tiles/glass or standard screw mounting.'
      }
    ],
    specs: [
      { label: 'Material', value: 'High-Durability Heat-Resistant Plastic' },
      { label: 'No. of Shelves', value: '1 Main Rack with Multi-Compartment Divider' },
      { label: 'Dimensions', value: 'Product Breadth: 10 cm, Height: 1.5 cm, Length: 10 cm' },
      { label: 'Net Quantity', value: '1 Unit' },
      { label: 'Mounting Type', value: 'Wall Mounted (Adhesive & Screw Compatible)' },
      { label: 'Country of Origin', value: 'India' }
    ],
    boxItems: [
      '1x Wall-Mounted Hair Tool Organizer Rack',
      '1x Heavy-Duty Traceless Adhesive Wall Pad',
      '1x Hardware Screw & Wall Anchor Pack'
    ],
    bundles: [
      { quantity: 1, label: 'Single Unit', price: 449, originalPrice: 899, discount: '50% OFF' },
      { quantity: 2, label: 'Set of 2 (Master & Guest Bath)', price: 799, originalPrice: 1798, discount: 'SAVE 55%', badge: 'POPULAR' }
    ],
    faqs: [
      {
        q: 'Can I place my hot hair dryer in it immediately?',
        a: 'Yes, the high-grade heat-resistant polymer is rated to withstand hot styling tools right after use without warping or melting.'
      },
      {
        q: 'Does it require drilling into bathroom tiles?',
        a: 'No! It comes with an ultra-strong moisture-proof adhesive pad that holds firmly on clean tiles, mirrors, and smooth surfaces without drilling.'
      }
    ],
    reviews: [
      {
        id: 'rev-rack-1',
        author: 'Ananya Sen',
        location: 'Kolkata, WB',
        rating: 5,
        date: '3 days ago',
        title: 'Finally bathroom vanity is completely clean!',
        comment: 'Holds my blow dryer, large paddle brush, two combs, and face serum neatly. The wire hook is super convenient.',
        verified: true
      }
    ]
  },
  {
    id: 'x4cart-touch-control-led-lamp',
    title: 'X4cart Touch Control LED Table Lamp – USB Rechargeable Night Light (3-Color Dimmable)',
    tagline: 'Wireless Touch Sensor Bedside Lamp with 3000K/4500K/6000K Color Modes & 380h Battery',
    price: 599,
    originalPrice: 1199,
    discountPercent: 50,
    inventory: 45,
    rating: 4.9,
    reviewCount: 2480,
    category: 'Home & Lighting',
    status: 'Active',
    badge: 'Sale',
    shortDescription: 'X4cart USB rechargeable touch control table lamp with 3 color temperatures (Warm 3000K, Warm White 4500K, White 6000K) and stepless dimmer for bedroom, study, and emergencies.',
    description: `X4cart Touch Control LED Table Lamp – USB Rechargeable, Touch Control Night Light with 3-Color Dimmable Brightness for Bedroom, Living Room & Study Lamp Decor (White, Pack of 1)

• 3-Mode Control: Adjust brightness and light mode (3000K Warm Light, 4500K Warm White Light, 6000K White Light) using responsive touch sensor for effortless operation.
• USB Rechargeable & Wireless Use: Built-in lithium battery with USB charging cable for convenient recharging, energy-saving and eco-friendly (Power Input: 5V/1A).
• Long-Lasting Battery Life: Low brightness continuity up to 380 hours, high brightness continuity up to 23 hours.
• Soft & Relaxing Mood Light: Ideal for reading, ambiance, and gentle nighttime lighting with adjustable brightness.
• Versatile & Portable: Perfect for bedrooms, living rooms, bedside tables, office overtime, power outages, and outdoor camping.
• Modern Minimalist Design: Stylish and sleek cylinder design blending seamlessly into any modern room decor.
• Package Contains: 1x Touch Control Bedside LED Desk Lamp, USB Cable, User Manual
• Country of Origin: India`,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=900&auto=format&fit=crop&q=80'
    ],
    variants: ['Pure White (3-Color Mode)', 'Soft Ivory (3-Color Mode)'],
    features: [
      {
        title: '3-Mode Smart Touch Control',
        desc: 'Tap sensor to switch between 3000K Warm Light, 4500K Warm White, and 6000K Daylight.'
      },
      {
        title: 'Extended Battery Life (Up to 380h)',
        desc: 'Rechargeable built-in battery powers up to 380h on low mode or 23h on full illumination.'
      },
      {
        title: 'USB Cordless Portability',
        desc: 'Lightweight cordless form factor makes it effortless to carry between rooms, desks, or patio.'
      },
      {
        title: 'Gentle Eye-Comfort Light',
        desc: 'Soft diffused lampshade ensures zero glare or flicker, ideal for bedtime and late study.'
      }
    ],
    specs: [
      { label: 'Brand', value: 'X4cart' },
      { label: 'Material', value: 'High-Grade Matte Plastic' },
      { label: 'Assembly', value: 'Fully Assembled' },
      { label: 'Bulb Included', value: 'Yes (Integrated Energy-Saving LED)' },
      { label: 'Shade Colour', value: 'White' },
      { label: 'Switch Type', value: 'Dimmer / Touch Sensor' },
      { label: 'Dimensions', value: 'Breadth: 7.5 cm, Height: 10.5 cm, Length: 7.5 cm' },
      { label: 'Net Quantity', value: '1 Unit' },
      { label: 'Country of Origin', value: 'India' }
    ],
    boxItems: [
      '1x X4cart Touch Control Bedside LED Table Lamp',
      '1x USB Quick-Charging Cable',
      '1x User Manual'
    ],
    bundles: [
      { quantity: 1, label: 'Single Lamp (1 Unit)', price: 599, originalPrice: 1199, discount: '50% OFF' },
      { quantity: 2, label: 'Twin Pack (Set of 2 - Bedside Pair)', price: 1099, originalPrice: 2398, discount: 'SAVE 54%', badge: 'POPULAR' }
    ],
    faqs: [
      {
        q: 'How do I change the light modes?',
        a: 'Simply tap the sensitive touch sensor on the lamp. Each light tap cycles through 3000K warm, 4500K natural white, and 6000K daylight, with long-press for stepless dimming.'
      },
      {
        q: 'How long does the battery last on a single charge?',
        a: 'The built-in rechargeable battery delivers up to 380 hours on low nightlight brightness and 23 hours on high brightness.'
      }
    ],
    reviews: [
      {
        id: 'rev-lamp-1',
        author: 'Sunil Nair',
        location: 'Kochi, KL',
        rating: 5,
        date: '3 days ago',
        title: 'Perfect bedside lamp, very responsive touch',
        comment: 'The touch sensor works immediately without hunting for a switch in the dark. The warm light is soothing and battery lasts days without recharging.',
        verified: true
      }
    ]
  },
  {
    id: 'silicone-back-scrubber-pack-3',
    title: 'Silicone Back Scrubber – Pack of 3',
    tagline: 'Multi-Color Flexible Exfoliating Body Scrubber with Dual Handles',
    price: 299,
    originalPrice: 599,
    discountPercent: 50,
    inventory: 30,
    rating: 4.8,
    reviewCount: 1890,
    category: 'Bath & Personal Care',
    status: 'Active',
    badge: 'Sale',
    shortDescription: 'Pack of 3 food-grade silicone body and back scrubbers with double-sided bristles and easy-grip handles.',
    description: `Deeply cleanse hard-to-reach areas of your back effortlessly. Made of 100% antibacterial food-grade silicone with dual-sided textures: soft micro-bristles for gentle lathering and rounded beads for invigorating circulation massage.

• Pack of 3 vibrant multi-color scrubbers (Green, Pink, Blue)
• Quick-drying and mildew resistant, far more hygienic than loofahs
• Ergonomic dual pull handles for flexible back reach
• 70cm extended length stretches easily`,
    image: 'https://images.unsplash.com/photo-1608248597359-2ff43bc1a16b?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248597359-2ff43bc1a16b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
    ],
    variants: ['Pack of 3 (Green, Pink, Blue)', 'Pack of 3 (Monochrome Black/Grey/White)'],
    specs: [
      { label: 'Material', value: '100% Food-Grade Eco Silicone' },
      { label: 'Length', value: '70 cm (Stretches to 90 cm)' },
      { label: 'Quantity', value: '3 Scrubbers per Pack' },
      { label: 'Origin', value: 'India' }
    ]
  }
];
