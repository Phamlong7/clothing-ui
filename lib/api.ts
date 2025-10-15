const API = process.env.NEXT_PUBLIC_API_BASE || "";
import { fetchJson, handleResponse } from "@/lib/http";

// Dev SSR over HTTPS localhost may fail due to self-signed certificates.
// Opt-in bypass: set ALLOW_INSECURE_TLS=true to disable certificate verification
// Only effective in development and for localhost API.
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
  try {
    const isLocalHttps = API.startsWith("https://localhost");
    const allowInsecure = process.env.ALLOW_INSECURE_TLS === "true";
    if (isLocalHttps && allowInsecure) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
  } catch {
    // ignore
  }
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ListResp = {
  data: Product[];
  total: number;
  page: number;
  pages: number;
};

// Client-side filtering only - backend returns all products
export type ListProductsParams = Record<string, never>;

// -------------------------
// Auth / Cart / Orders Types
// -------------------------

export type AuthToken = string;

export type RegisterBody = { email: string; password: string };
export type LoginBody = { email: string; password: string };
export type LoginResp = { token: string };

export type CartProduct = Product;
export type CartItem = {
  id: string;
  product: CartProduct;
  quantity: number;
  lineTotal: number;
};
export type Cart = { items: CartItem[]; total: number };

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};
export type Order = {
  id: string;
  userId: string;
  totalAmount: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
  items: OrderItem[];
};

// -------------------------
// Token utilities (client-only)
// -------------------------

const TOKEN_KEY = "auth:token";

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  } else {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

// authHeaders no longer needed; fetchJson attaches Authorization automatically

function buildProductsUrl() {
  try {
    const base = API.trim();
    if (!base) throw new Error("Missing NEXT_PUBLIC_API_BASE");
    const url = new URL(`${base}/api/Products`);
    return url;
  } catch (e) {
    console.error("Invalid or missing API base URL. Set NEXT_PUBLIC_API_BASE in .env.local, e.g. http://localhost:5000", e);
    return null;
  }
}

export async function listProducts(): Promise<Product[]> {
  const url = buildProductsUrl();
  if (!url) return [];
  try {
    const { res, correlationId } = await fetchJson(url);
    const data = await handleResponse<unknown>(res, correlationId);
    if (Array.isArray(data)) return data as Product[];
    if (
      data &&
      typeof data === "object" &&
      Array.isArray((data as { data?: unknown }).data)
    ) {
      const wrapped = data as { data?: unknown };
      return (wrapped.data as Product[]) || [];
    }
    return [];
  } catch (err) {
    console.error("listProducts failed:", err);
    return [];
  }
}

export async function getProduct(id: string): Promise<Product> {
  const { res, correlationId } = await fetchJson(`${API}/api/Products/${id}`);
  return await handleResponse<Product>(res, correlationId);
}

export async function createProduct(body: Omit<Product, "id">) {
  const { res, correlationId } = await fetchJson(`${API}/api/Products`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return await handleResponse<Product>(res, correlationId);
}

export async function updateProduct(id: string, body: Partial<Omit<Product, "id">>) {
  const { res, correlationId } = await fetchJson(`${API}/api/Products/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return await handleResponse<Product>(res, correlationId);
}

export async function deleteProduct(id: string) {
  const { res, correlationId } = await fetchJson(`${API}/api/Products/${id}`, { method: "DELETE" });
  return await handleResponse<{ ok: true }>(res, correlationId);
}

// -------------------------
// Auth API
// -------------------------

export async function register(body: RegisterBody): Promise<{ ok: true }> {
  const { res, correlationId } = await fetchJson(`${API}/api/Auth/register`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return await handleResponse<{ ok: true }>(res, correlationId);
}

export async function login(body: LoginBody): Promise<LoginResp> {
  const { res, correlationId } = await fetchJson(`${API}/api/Auth/login`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return await handleResponse<LoginResp>(res, correlationId);
}

export function logout(): void {
  setAuthToken(null);
}

// -------------------------
// Cart API (auth required)
// -------------------------

export async function getCart(): Promise<Cart> {
  const { res, correlationId } = await fetchJson(`${API}/api/Cart`);
  return await handleResponse<Cart>(res, correlationId);
}

export async function addToCart(productId: string, quantity: number): Promise<CartItem> {
  const { res, correlationId } = await fetchJson(`${API}/api/Cart`, {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
  return await handleResponse<CartItem>(res, correlationId);
}

export async function updateCartItem(id: string, quantity: number): Promise<CartItem> {
  const { res, correlationId } = await fetchJson(`${API}/api/Cart/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
  return await handleResponse<CartItem>(res, correlationId);
}

export async function deleteCartItem(id: string): Promise<{ ok: true }> {
  const { res, correlationId } = await fetchJson(`${API}/api/Cart/${id}`, { method: "DELETE" });
  return await handleResponse<{ ok: true }>(res, correlationId);
}

// -------------------------
// Orders API (auth required)
// -------------------------

export async function listOrders(): Promise<Order[]> {
  const { res, correlationId } = await fetchJson(`${API}/api/Orders`);
  return await handleResponse<Order[]>(res, correlationId);
}

export async function getOrder(id: string): Promise<Order> {
  const { res, correlationId } = await fetchJson(`${API}/api/Orders/${id}`);
  return await handleResponse<Order>(res, correlationId);
}

export type CreateOrderResp =
  | Order
  | { order: Order; payos: unknown }
  | { order: Order; vnpay: { url: string } };

export async function createOrder(payload?: { paymentMethod?: "simulate" | "payos" | "vnpay" }): Promise<CreateOrderResp> {
  const { res, correlationId } = await fetchJson(`${API}/api/Orders`, {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });
  return await handleResponse<CreateOrderResp>(res, correlationId);
}

export type PayOrderResp =
  | Order
  | { order: Order; payos: unknown }
  | { order: Order; vnpay: { url: string } };

export async function payOrder(id: string): Promise<PayOrderResp> {
  const { res, correlationId } = await fetchJson(`${API}/api/Orders/${id}/pay`, { method: "POST" });
  return await handleResponse<PayOrderResp>(res, correlationId);
}
