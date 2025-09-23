"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for clothing, brands, styles..."
          className="w-full pl-14 pr-6 py-5 text-lg border-2 border-slate-200/50 rounded-3xl focus:outline-none focus:border-purple-500 focus:ring-8 focus:ring-purple-500/10 transition-all bg-white/70 backdrop-blur-xl shadow-lg hover:shadow-xl group-hover:border-slate-300/70 placeholder-slate-400"
        />
        <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-purple-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Submit button - only visible when there's text */}
        {query && (
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Search
          </button>
        )}
      </div>
    </form>
  );
}
