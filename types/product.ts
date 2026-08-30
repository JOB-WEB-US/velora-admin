export interface Category {
  id: string;
  name: string;
  slug: string;
  isHidden?: boolean;
  isTrendingMenu?: boolean;
  menuOrder?: number;
  badgeText?: string | null;
  icon?: string | null;
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
  isActive?: boolean;
  type?: { id: string; name: string; isActive?: boolean };
  colorRel?: { id: string; name: string; hexCode?: string; isActive?: boolean };
  sizeRel?: { id: string; name: string; isActive?: boolean };
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
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
  printFileFront?: string;
  printFileBack?: string;
  printDimensions?: string;
  printDriveUrl?: string;
  printNotes?: string;
  isSale: boolean;
  isFeatured: boolean;
  isActive?: boolean;
  rating: number;
  reviewCount: number;
  categoryId?: string | null;
  category?: Category | null;
  variants?: ProductVariant[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface DraftVariant {
  sku: string;
  productType: string;
  size: string;
  color: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  stock: number;
  isActive?: boolean;
}

export interface CreateProductInput {
  title: string;
  slug: string;
  description?: string;
  basePrice: number;
  originalPrice?: number;
  frontImage: string;
  backImage?: string;
  printFileFront?: string;
  printFileBack?: string;
  printDimensions?: string;
  printDriveUrl?: string;
  printNotes?: string;
  isSale?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  categoryId?: string | null;
  variants?: DraftVariant[];
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
  isActive?: boolean;
}
