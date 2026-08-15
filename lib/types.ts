// Types mirroring the Supabase schema (kingboostfarms_schema.sql)

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: "product" | "gallery" | "both";
  created_at: string;
}

export interface Product {
  id: string;
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
  category?: Category;
}

export interface GalleryItem {
  id: string;
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
  quantity: number;
  unit_price: number;
  created_at: string;
}

// Client-side cart item (not persisted until checkout)
export interface CartItem {
  product: Product;
  quantity: number;
}

// --- Academy ---
export interface Course {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  duration: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  course?: Course;
}

// --- Consulting ---
export interface ConsultingService {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  price_from: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsultingBooking {
  id: string;
  service_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  preferred_date: string | null;
  message: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  service?: ConsultingService;
}

// --- Agritech / Organics (shared inquiry form) ---
export type InquirySource = "agritech" | "organics" | "general";

export interface Inquiry {
  id: string;
  source: InquirySource;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
}
