import apiClient from './api'; // Adjust path as needed

// Raw shape from the backend
interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  price: { $numberDecimal: string } | number | string;
  category?: string;
  stock: number;
  image?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Transformed product for frontend use
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  images: string[];
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Extract numeric price from the backend's $numberDecimal format
const extractPrice = (price: any): number => {
  if (!price) return 0;
  if (typeof price === 'number') return price;
  if (typeof price === 'string') return parseFloat(price) || 0;
  if (typeof price === 'object' && price.$numberDecimal) {
    return parseFloat(price.$numberDecimal) || 0;
  }
  return 0;
};

// Placeholder images by category for products without images
const categoryImages: Record<string, string> = {
  Garden: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
  Industrial: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
  Health: 'https://images.unsplash.com/photo-1505576399279-0d754687a2d8?w=400',
  Beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  Games: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400',
  Music: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
  Toys: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400',
  Shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  Clothing: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
  Electronics: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
  Computers: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
  Books: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
  Baby: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
  Sports: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=400',
  Jewelry: 'https://images.unsplash.com/photo-1515562141589-67f0d569b8f4?w=400',
  Home: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
  Tools: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400',
  Grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
  Outdoors: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400',
  Automotive: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
  Kids: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
  Movies: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

const getImageForProduct = (product: BackendProduct): string => {
  if (product.image) return product.image;
  if (product.images && product.images.length > 0) return product.images[0];
  return categoryImages[product.category || ''] || DEFAULT_IMAGE;
};

const transformProduct = (raw: BackendProduct): Product => ({
  id: raw._id,
  name: raw.name || 'Untitled Product',
  description: raw.description || '',
  price: extractPrice(raw.price),
  category: raw.category || 'General',
  stock: raw.stock ?? 0,
  image: getImageForProduct(raw),
  images: raw.images || [getImageForProduct(raw)],
  inStock: (raw.stock ?? 0) > 0,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

class ProductsAPI {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get('/product');
      const raw: BackendProduct[] = response.data.data || [];
      return raw.map(transformProduct);
    } catch (error) {
      console.error('[ProductsAPI] getAllProducts error:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await apiClient.get(`/product/${id}`);
      return transformProduct(response.data.data);
    } catch (error) {
      console.error('[ProductsAPI] getProductById error:', error);
      throw error;
    }
  }
}

export const productsAPI = new ProductsAPI();
export default productsAPI;