// Types mirroring the Supabase schema (kingboostafrica_schema.sql)

export interface Farmer {
  id: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  state: string | null;
  phone: string | null;
  photo_url: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: "product" | "gallery" | "both";
  created_at: string;
}

export interface Product {
  id: string;
  farmer_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data (optional, populated by queries)
  farmer?: Farmer;
  category?: Category;
}

export interface GalleryItem {
  id: string;
  farmer_id: string | null;
  category_id: string | null;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  delivery_address: string | null;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  total_amount: number;
  payment_reference: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  farmer_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

// Client-side cart item (not persisted until checkout)
export interface CartItem {
  product: Product;
  quantity: number;
}
