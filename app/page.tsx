import { Suspense } from "react";
// import Link from "next/link";
import { listProducts, Product } from "@/lib/api";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { getPriceLabel } from "@/lib/filters";
import { DEFAULT_PAGE_SIZE, UI_TEXT } from "@/lib/constants";
import ClearFilters from "@/components/ClearFilters";

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

type ProductGridProps = {
  query: string;
  price: string;
  page: number;
};

async function ProductGrid({ query, price, page }: ProductGridProps) {
  console.log("📄 [ProductGrid] Rendering with:", { query, price, page });
  
  // Fetch from API with server-side pagination
  const response = await listProducts({ q: query, page, limit: PAGE_SIZE, price });
  
  // Handle both array and object response formats
  const apiProducts = Array.isArray(response) ? response : response.data || [];
  const total = Array.isArray(response) ? response.length : response.total || apiProducts.length;
  const pages = Array.isArray(response) ? 1 : Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Array.isArray(response) ? 1 : Math.min(Math.max(1, page), pages);
  
  console.log("📊 [ProductGrid] Results:", { total, pages, currentPage, productsCount: apiProducts.length });
  
  // Use products directly from API (server-side pagination)
  const products = apiProducts;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, total);
  const priceLabel = getPriceLabel(price);

  return (
    <>
      <section className="py-16 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto mb-12">
          <SearchBar />
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-50" id="all-products">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {UI_TEXT.products.listTitle}
              </h2>
              <p className="text-slate-600 mt-2">
                {total > 0
                  ? UI_TEXT.products.showingResults(from, to, total)
                  : UI_TEXT.products.noProductsYet}
              </p>
            </div>

            {(query || priceLabel) && (
              <div className="flex flex-wrap items-center gap-2">
                {query && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-4 py-2 text-sm font-semibold">
                    <span>{UI_TEXT.products.searchLabel}</span>
                    <span className="font-bold">&quot;{query}&quot;</span>
                  </span>
                )}
                {priceLabel && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-pink-100 text-pink-700 px-4 py-2 text-sm font-semibold">
                    <span>{UI_TEXT.products.priceLabel}</span>
                    <span className="font-bold">{priceLabel}</span>
                  </span>
                )}
                {(query || priceLabel) && (
                  // Client-side clear without full reload
                  // Replaces existing Link to avoid default navigation scroll
                  <ClearFilters />
                )}
              </div>
            )}
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8h-2M7 5h2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {query ? UI_TEXT.products.noResultsFound(query) : UI_TEXT.products.noProductsYet}
              </h3>
              <p className="text-slate-600 mb-6">
                {query ? UI_TEXT.products.noResultsMessage : UI_TEXT.products.noProductsMessage}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={currentPage} pages={pages} />
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; price?: string; page?: string }> }) {
  const sp = await searchParams;
  const query = sp?.q || "";
  const price = sp?.price || "";
  const page = Number(sp?.page) || 1;
  
  console.log("🏠 [HomePage] Received searchParams:", sp);
  console.log("🏠 [HomePage] Parsed values:", { query, price, page });
  
  // Create stable key to prevent Suspense remounting
  const stableKey = "product-grid";
  
  return (
    <>
      <Hero />
      <Suspense 
        key={stableKey}
        fallback={
          <div className="py-16">
            <Loading text={UI_TEXT.loading.products} size="lg" />
          </div>
        }
      >
        <ProductGrid query={query} price={price} page={page} />
      </Suspense>
    </>
  );
}