export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  emoji?: string;
  isFeatured?: boolean;
  h1?: string;
  heroSubtitle?: string;
  aboutSection?: string;
  whyChooseNamankart?: string[];
  buyingGuide?: Array<{ title: string; text: string }>;
  careInstructions?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  stock: number;
  attributes?: Record<string, string>;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string | Category;
  categorySlug: string;
  brand?: string;
  sku?: string;
  hsnCode?: string;
  gstRate?: number;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  weight?: string;
  dimensions?: string;
  images: string[];
  imageAlt?: string[];
  featuredImage?: string;
  thumbnail?: string;
  videoUrl?: string;
  shortDescription?: string;
  description?: string;
  overview?: string;
  benefits?: string;
  howToUse?: string;
  careInstructions?: string;
  spiritualSignificance?: string;
  packageContents?: string;
  specificationsTable?: Array<{ key: string; value: string }>;
  specifications?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  relatedProducts?: string[];
  frequentlyBoughtTogether?: string[];
  crossSellProducts?: string[];
  upsellProducts?: string[];
  shippingDescription?: string;
  shippingPoints?: string[];
  deliveryTimeline?: string;
  freeShipping?: boolean;
  reviewHeading?: string;
  reviewDescription?: string;
  reviewHighlights?: string[];
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
  tags?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewProduct?: boolean;
  isTrending?: boolean;
  isFestivalSpecial?: boolean;
  isHandcrafted?: boolean;
  isExclusive?: boolean;
  isActive?: boolean;
}

export interface OrderItem {
  product: string | Product;
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  qty: number;
  price: number;
}

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  email: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "cod" | "razorpay" | "upi";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "reserved" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: "customer" | "admin" | "manager" | "super_admin";
  orderCount?: number;
  totalSpent?: number;
  createdAt?: string;
}

export interface InventoryLog {
  _id: string;
  product: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  type: "purchase" | "sale" | "adjustment" | "return";
  qtyChange: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: "percentage" | "flat";
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface AuditLog {
  _id: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface BulkImportStagedData {
  importJob: {
    importId: string;
    summary: {
      totalProducts: number;
      newProducts: number;
      updatedProducts: number;
      matchedImages: number;
      missingImages: number;
      duplicateSlugCount: number;
    };
  };
  stagedProducts: unknown[];
  errorReport: Array<{ product: string; message: string }>;
}
