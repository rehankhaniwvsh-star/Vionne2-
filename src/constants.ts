export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  images: string[];
  variants: string[];
}

export const PRODUCTS: Product[] = [];

export const COLLECTIONS: { name: string; image: string }[] = [];
