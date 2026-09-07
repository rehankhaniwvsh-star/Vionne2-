export * from './data/mockProducts';

import { INITIAL_PRODUCTS, Product } from './data/mockProducts';

export const PRODUCTS: Product[] = INITIAL_PRODUCTS;

export const COLLECTIONS = [
  { 
    name: 'Fashion Accessories', 
    slug: 'fashion-accessories',
    description: 'Ergonomic buckleless belts and modern everyday wear essentials.',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb8ecf7db?w=800' 
  },
  { 
    name: 'Smart Living', 
    slug: 'smart-living',
    description: 'Atmospheric sunset lighting and intelligent home aesthetics.',
    image: 'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=800' 
  },
  { 
    name: 'Wellness Tech', 
    slug: 'wellness-tech',
    description: 'High-speed portable blending and active health nutrition.',
    image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=800' 
  },
  { 
    name: 'Lifestyle & Sleep', 
    slug: 'lifestyle',
    description: 'Deep sleep blackout acoustics and relaxation gear.',
    image: 'https://images.unsplash.com/photo-1541140111954-78af4c37ad2c?w=800' 
  }
];

