import { Suspense } from "react";
import { listProducts, Product } from "@/lib/api";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";

async function ProductGrid({ query }: { query: string }) {
  const response = await listProducts(query);
  const products = Array.isArray(response) ? response : response.data || [];

  return (
    <>
      <section className="py-16 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto mb-12">
          <SearchBar />
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-slate-900">
              All Products 
              <span className="text-lg font-normal text-slate-600 ml-2">
                ({products.length} items)
              </span>
            </h2>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8h-2M7 5h2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {query ? `No products found for "${query}"` : "No products yet"}
              </h3>
              <p className="text-slate-600 mb-6">
                {query ? "Try searching for something else" : "Start by adding some products to your store"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const query = sp?.q || "";
  
  return (
    <>
      <Hero />
      <Suspense 
        fallback={
          <div className="py-16">
            <Loading text="Loading products..." size="lg" />
          </div>
        }
      >
        <ProductGrid query={query} />
      </Suspense>
    </>
  );
}