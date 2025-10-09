"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICE_RANGES } from "@/lib/filters";
import { markScrollPositionForNextNavigation, markScrollTarget } from "@/lib/scroll";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [price, setPrice] = useState(searchParams.get("price") ?? "");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isPending, startTransition] = useTransition();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setPrice(searchParams.get("price") ?? "");
  }, [searchParams]);

  const performSearch = useCallback(
    (searchQuery: string, searchPrice: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update params
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      } else {
        params.delete("q");
      }

      if (searchPrice) {
        params.set("price", searchPrice);
      } else {
        params.delete("price");
      }

      // Reset to page 1 when search/filter changes
      params.delete("page");

      const newUrl = params.toString() ? `/?${params.toString()}` : "/";
      const currentUrl = searchParams.toString() ? `/?${searchParams.toString()}` : "/";

      if (newUrl === currentUrl) {
        return;
      }

      // Use startTransition to prevent layout shift and maintain scroll
       markScrollTarget("all-products");
       markScrollPositionForNextNavigation(newUrl);
      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [router, searchParams, startTransition]
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Shorter delay for better responsiveness
    const delay = newQuery.length > 0 ? 300 : 100; // Faster for clearing
    debounceTimer.current = setTimeout(() => {
      performSearch(newQuery, price);
    }, delay);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    
    // Clear any pending search to avoid conflicts
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Search immediately when price changes with smooth transition
    requestAnimationFrame(() => {
      performSearch(query, newPrice);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear debounce and search immediately on submit
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Immediate search with smooth transition
    requestAnimationFrame(() => {
      performSearch(query, price);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto" role="search">
      <div className="flex flex-col md:flex-row gap-4 md:items-stretch">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search for clothing, brands, styles..."
            aria-label="Search products"
            style={{ color: "#0f172a" }}
            className="w-full h-full pl-14 pr-6 py-5 text-lg font-semibold border-2 border-slate-200/50 rounded-3xl focus:outline-none focus:border-purple-500 focus:ring-8 focus:ring-purple-500/10 transition-all duration-300 bg-white backdrop-blur-xl shadow-lg hover:shadow-xl group-hover:border-slate-300 placeholder:text-slate-400 placeholder:font-normal"
          />
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-purple-500 transition-colors pointer-events-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Price Filter Dropdown */}
        <div className="relative w-full sm:w-56">
          <label className="sr-only" htmlFor="priceRange">Filter by price</label>
          <select
            id="priceRange"
            value={price}
            onChange={handlePriceChange}
            style={{ 
              color: '#0f172a', 
              fontWeight: '600',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 1.25rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25em 1.25em'
            }}
            className="relative z-10 w-full h-full pl-12 pr-12 py-5 bg-white backdrop-blur-xl border-2 border-slate-200/50 rounded-3xl text-base focus:outline-none focus:border-purple-500 focus:ring-8 focus:ring-purple-500/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-slate-300 appearance-none cursor-pointer"
          >
            {PRICE_RANGES.map((range) => (
              <option 
                key={range.value} 
                value={range.value}
                style={{ 
                  color: '#0f172a', 
                  fontWeight: '600', 
                  backgroundColor: '#ffffff',
                  padding: '0.75rem'
                }}
              >
                {range.label}
              </option>
            ))}
          </select>
          
          {/* Leading icon for dropdown (placed under the select using z-index to avoid overlap) */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none z-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Hidden submit for Enter key */}
      <button type="submit" className="hidden" aria-label="Search" />
    </form>
  );
}
