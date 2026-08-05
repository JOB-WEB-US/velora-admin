export type OrderStatus = "PLACED" | "PRINTING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: {
    id: string;
    title: string;
    frontImage: string;
    slug?: string;
  };
  variantId?: string;
  productType: string;
  size: string;
  color: string;
  quantity: number;
  price: number; // Decrypted float for admin
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  userId?: string;
  status: OrderStatus;
  
  customerName: string;
  customerEmail: string;
  phone: string; // Decrypted for admin
  address: string; // Decrypted for admin
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  subtotal: number; // Decrypted float for admin
  discount: number; // Decrypted float for admin
  tax: number; // Decrypted float for admin
  totalPrice: number; // Decrypted float for admin
  paymentMethod: string;
  
  shippingMethodName: string;
  trackingNumber?: string;
  carrier?: string;
  
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
}
