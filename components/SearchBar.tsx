"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICE_RANGES } from "@/lib/filters";
import { UI_TEXT } from "@/lib/constants";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [price, setPrice] = useState(searchParams.get("price") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setPrice(searchParams.get("price") ?? "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (price) params.set("price", price);
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto" role="search">
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        <div className="relative flex-1 group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={UI_TEXT.search.placeholder}
            aria-label="Search products"
            className="w-full pl-14 pr-6 py-5 text-lg border-2 border-slate-200/50 rounded-3xl focus:outline-none focus:border-purple-500 focus:ring-8 focus:ring-purple-500/10 transition-all bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-xl group-hover:border-slate-300/70 placeholder-slate-400"
          />
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-purple-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <label className="sr-only" htmlFor="priceRange">Filter by price</label>
          <select
            id="priceRange"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full sm:w-48 px-5 py-4 bg-white/70 backdrop-blur-xl border-2 border-slate-200/50 rounded-3xl text-base text-slate-700 focus:outline-none focus:border-purple-500 focus:ring-8 focus:ring-purple-500/10 transition-all shadow-lg hover:shadow-xl"
          >
            {PRICE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-3xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {UI_TEXT.search.submitButton}
          </button>
        </div>
      </div>
    </form>
  );
}
