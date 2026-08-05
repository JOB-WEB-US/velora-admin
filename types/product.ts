export interface Category {
  id: string;
  name: string;
  slug: string;
  isHidden?: boolean;
  _count?: {
    products: number;
  };
  products?: { id: string; title: string; isActive?: boolean }[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  productId: string;
  productType: string; // T-Shirt, Hoodie, Sweatshirt, Tank Top, etc.
  size: string; // S, M, L, XL, 2XL, 3XL
  color: string; // Black, Navy, White, Red, etc.
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  basePrice: number;
  originalPrice?: number;
  frontImage: string;
  backImage?: string;
  isSale: boolean;
  isFeatured: boolean;
  isActive?: boolean;
  rating: number;
  reviewCount: number;
  categoryId?: string | null;
  category?: Category | null;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  title: string;
  slug: string;
  description?: string;
  basePrice: number;
  originalPrice?: number;
  frontImage: string;
  backImage?: string;
  isSale?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  categoryId?: string | null;
}

export interface CreateVariantInput {
  sku: string;
  productId: string;
  productType: string;
  size: string;
  color: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  stock: number;
}
