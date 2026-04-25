// Shop Feature Types

export type ProductCategory = 'Devotional' | 'Worship' | 'Spiritual Growth' | 'Prophetic';

export type Language = 'EN' | 'FR' | 'DE';

export interface Product {
  id: string;
  title: string;
  author: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: ProductCategory;
  languages: Language[];
  description?: string;
  isBook?: boolean;
  isAlbum?: boolean;
  stripeLink?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedLanguages: Language[];
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface FilterState {
  category: ProductCategory | 'All';
  language: Language | 'All Languages';
  searchQuery: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  backgroundImage?: string;
  ctaText: string;
}
