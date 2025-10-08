const API = process.env.NEXT_PUBLIC_API_BASE || "";

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

export type ListProductsParams = {
  q?: string;
  page?: number;
  limit?: number;
  price?: string;
};

function buildPriceFilters(range?: string) {
  if (!range) return {};
  const [min, max] = range.split("-");
  
  const priceMin = min && min.trim() ? Number(min) : undefined;
  const priceMax = max && max.trim() ? Number(max) : undefined;
  
  console.log("💵 [API] buildPriceFilters:", { range, min, max, priceMin, priceMax });
  
  return {
    priceMin,
    priceMax,
  };
}

function buildProductsUrl(q: string, page: number, limit: number, priceMin?: number, priceMax?: number) {
  try {
    const base = API.trim();
    if (!base) throw new Error("Missing NEXT_PUBLIC_API_BASE");
    const url = new URL(`${base}/api/Products`);
    if (q) url.searchParams.set("q", q);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));
    if (typeof priceMin === "number") url.searchParams.set("priceMin", String(priceMin));
    if (typeof priceMax === "number") url.searchParams.set("priceMax", String(priceMax));
    return url;
  } catch (e) {
    console.error("Invalid or missing API base URL. Set NEXT_PUBLIC_API_BASE in .env.local, e.g. http://localhost:5000", e);
    return null;
  }
}

export async function listProducts(params: ListProductsParams = {}): Promise<ListResp> {
  const { q = "", page = 1, limit = 12, price } = params;
  const { priceMin, priceMax } = buildPriceFilters(price);

  console.log("🔍 [API] listProducts called with:", { q, page, limit, price, priceMin, priceMax });

  try {
    const url = buildProductsUrl(q, page, limit, priceMin, priceMax);
    if (!url) {
      console.error("❌ [API] Failed to build URL");
      return { data: [], total: 0, page, pages: 1 };
    }

    console.log("📡 [API] Fetching:", url.toString());
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();
    console.log("✅ [API] Response:", { total: result.total, items: result.data?.length, pages: result.pages });
    return result;
  } catch (err) {
    // Network or TLS errors: provide a safe fallback for UI
    console.error("❌ [API] listProducts fetch failed:", err);
    return { data: [], total: 0, page, pages: 1 };
  }
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API}/api/Products/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createProduct(body: Omit<Product, "id">) {
  const res = await fetch(`${API}/api/Products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProduct(id: string, body: Partial<Omit<Product, "id">>) {
  const res = await fetch(`${API}/api/Products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API}/api/Products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
