export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  secondaryImages?: string[];
  status: "Available" | "Sold Out";
  rating: number;
  reviewsCount: number;
  sizes: string[];
  colors: string[];
  quantityAvailable: number;
}

export interface CartItem {
  product: Product;
  qty: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType: "delivery" | "pickup";
  deliveryDate: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderDate: string;
  status: "Pending" | "Ready for Pickup" | "Shipped" | "Delivered" | "Cancelled";
  paymentRef: string;
  notes?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minSpend: number;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
