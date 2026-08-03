import type {
  AuditLog,
  BulkImportStagedData,
  Category,
  Coupon,
  InventoryLog,
  Order,
  Product,
  User,
} from "../types";

const RAW_API_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "";

/** Single Source of Truth for API version prefix */
export const API_BASE_URL = RAW_API_URL
  ? RAW_API_URL.replace(/\/+$/, "").endsWith("/api/v1")
    ? RAW_API_URL.replace(/\/+$/, "")
    : `${RAW_API_URL.replace(/\/+$/, "")}/api/v1`
  : "/api/v1";

function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("nk_admin_token");
  }
  return null;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  let json: any = null;

  if (contentType.includes("application/json")) {
    try {
      json = await res.json();
    } catch {
      // Ignore JSON parse error if response body is malformed or empty
    }
  }

  if (!res.ok) {
    let errorMsg =
      json?.message ||
      (json?.errors && Array.isArray(json.errors)
        ? json.errors.map((e: any) => e.message || e).join(", ")
        : null);

    if (!errorMsg) {
      const rawText = await res.text().catch(() => "");
      if (rawText && !rawText.trim().startsWith("<")) {
        errorMsg = rawText.trim();
      } else {
        errorMsg = `Server error (${res.status} ${res.statusText || "Error"}). API: ${res.url}`;
      }
    }

    throw new Error(errorMsg);
  }

  if (json !== null) {
    return json.data !== undefined ? json.data : json;
  }

  const text = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(text);
    return parsed.data !== undefined ? parsed.data : parsed;
  } catch {
    return text as unknown as T;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  return parseResponse<T>(res);
}

export const adminApi = {
  // Auth
  login: async (email: string, password: string): Promise<{ user: User; accessToken: string }> => {
    const data = await request<{ user: User; accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.accessToken && typeof window !== "undefined") {
      localStorage.setItem("nk_admin_token", data.accessToken);
    }
    return data;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nk_admin_token");
    }
  },

  getProfile: async (): Promise<User> => {
    return request<User>("/auth/me");
  },

  // Dashboard Dedicated APIs
  getDashboardSummary: async () => {
    return request<{
      totalRevenue: number;
      totalOrders: number;
      totalProducts: number;
      totalCategories: number;
      totalCustomers: number;
    }>("/dashboard/summary");
  },

  getDashboardSales: async () => {
    return request<{ salesByStatus: any[]; monthlySales: any[] }>("/dashboard/sales");
  },

  getDashboardLowStock: async () => {
    return request<Product[]>("/dashboard/low-stock");
  },

  // Products
  getProducts: async (params?: Record<string, string>): Promise<Product[]> => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<Product[]>(`/products${query}`);
  },

  createProduct: async (payload: Partial<Product>): Promise<Product> => {
    return request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateProduct: async (id: string, payload: Partial<Product>): Promise<Product> => {
    return request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    await request<void>(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    return request<Category[]>("/categories");
  },

  createCategory: async (payload: Partial<Category>): Promise<Category> => {
    return request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateCategory: async (id: string, payload: Partial<Category>): Promise<Category> => {
    return request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteCategory: async (id: string): Promise<void> => {
    await request<void>(`/categories/${id}`, {
      method: "DELETE",
    });
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    return request<Order[]>("/orders");
  },

  updateOrderStatus: async (id: string, orderStatus: string, paymentStatus?: string): Promise<Order> => {
    return request<Order>(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ orderStatus, paymentStatus }),
    });
  },

  // Inventory Management
  getInventoryLogs: async (): Promise<InventoryLog[]> => {
    return request<InventoryLog[]>("/inventory/logs");
  },

  adjustStock: async (productId: string, qtyChange: number, reason: string, variantId?: string) => {
    return request("/inventory/adjust", {
      method: "POST",
      body: JSON.stringify({ productId, qtyChange, reason, variantId }),
    });
  },

  recordPurchase: async (productId: string, qtyAdded: number, supplier: string) => {
    return request("/inventory/purchase-entry", {
      method: "POST",
      body: JSON.stringify({ productId, qtyAdded, supplier }),
    });
  },

  // Customers
  getCustomers: async (q?: string): Promise<User[]> => {
    const query = q ? `?q=${encodeURIComponent(q)}` : "";
    return request<User[]>(`/customers${query}`);
  },

  // Coupons
  getCoupons: async (): Promise<Coupon[]> => {
    return request<Coupon[]>("/coupons");
  },

  createCoupon: async (payload: Partial<Coupon>): Promise<Coupon> => {
    return request<Coupon>("/coupons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deleteCoupon: async (id: string): Promise<void> => {
    await request<void>(`/coupons/${id}`, {
      method: "DELETE",
    });
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return request<AuditLog[]>("/audit-logs");
  },

  // Health / Monitoring check
  checkHealth: async (): Promise<{ status: string; mongodb: string }> => {
    const res = await fetch(`${API_BASE_URL}/health`);
    return parseResponse(res);
  },

  // Reports download helper
  downloadReport: async (endpoint: string, filename: string): Promise<void> => {
    const token = getAuthToken();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const res = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      throw new Error(`Failed to download report: ${res.statusText}`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  // Media & Uploads
  uploadImages: async (
    files: File[],
    folderIdentifier?: string
  ): Promise<
    Array<{
      url: string;
      publicId: string;
      width?: number;
      height?: number;
      format?: string;
      bytes?: number;
      createdAt?: string;
    }>
  > => {
    const token = getAuthToken();
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    if (folderIdentifier) {
      formData.append("folderIdentifier", folderIdentifier);
    }

    const res = await fetch(`${API_BASE_URL}/uploads/images`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    return parseResponse(res);
  },

  deleteUploadImage: async (publicId: string): Promise<void> => {
    const token = getAuthToken();
    const res = await fetch(
      `${API_BASE_URL}/uploads/images/${encodeURIComponent(publicId)}`,
      {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    await parseResponse(res);
  },

  // Bulk Catalog Import API
  downloadImportTemplate: async (): Promise<void> => {
    return adminApi.downloadReport("/imports/template", "namankart_products_template.json");
  },

  uploadBulkImportZip: async (file: File): Promise<BulkImportStagedData> => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/imports`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    return parseResponse<BulkImportStagedData>(res);
  },

  getImportReport: async (importId: string) => {
    return request(`/imports/${importId}/report`);
  },

  getImportDiff: async (importId: string) => {
    return request(`/imports/${importId}/diff`);
  },

  getImportStatus: async (importId: string) => {
    return request(`/imports/${importId}/status`);
  },

  commitBulkImport: async (importId: string, options?: any) => {
    return request(`/imports/${importId}/commit`, {
      method: "POST",
      body: JSON.stringify(options || {}),
    });
  },

  rollbackBulkImport: async (importId: string) => {
    return request(`/imports/${importId}/rollback`, {
      method: "POST",
    });
  },

  getImportHistory: async () => {
    return request<any[]>("/imports");
  },
};
