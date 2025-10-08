"use client";

import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

type PaginationProps = {
  page: number;
  pages: number;
};

export default function Pagination({ page, pages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show pagination only when there are multiple pages
  if (pages <= 1) {
    return null;
  }

  const goToPage = (nextPage: number) => {
    // Prevent unnecessary navigation if already on the same page
    if (nextPage === page) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    
    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    
    // Use router.replace with scroll: false to prevent full page reload
    router.replace(newUrl, { scroll: false });
    
    // Scroll to products section after navigation
    setTimeout(() => {
      const productsSection = document.getElementById("all-products");
      if (productsSection) {
        productsSection.scrollIntoView({ 
          behavior: "smooth", 
          block: "start",
          inline: "nearest"
        });
      }
    }, 100);
  };

  // Limit pagination buttons to avoid too many buttons
  const maxVisiblePages = 5;
  const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(pages, startPage + maxVisiblePages - 1);
  const items = Array.from({ length: endPage - startPage + 1 }, (_, idx) => startPage + idx);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 flex-wrap"
    >
      <button
        type="button"
        onClick={() => goToPage(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-2xl border-2 border-purple-500/70 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-sm font-bold text-white hover:from-purple-600/40 hover:to-pink-600/40 hover:border-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600/30 disabled:hover:to-pink-600/30"
      >
        Previous
      </button>

      {/* Show first page if not in range */}
      {startPage > 1 && (
        <>
          <button
            type="button"
            onClick={() => goToPage(1)}
            className="w-10 h-10 rounded-2xl font-bold transition-all duration-300 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-2 border-purple-400/50 hover:from-purple-600/40 hover:to-pink-600/40 hover:border-purple-500"
          >
            1
          </button>
          {startPage > 2 && <span className="text-white/60">...</span>}
        </>
      )}

      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => goToPage(item)}
          className={clsx(
            "w-10 h-10 rounded-2xl font-bold transition-all duration-300",
            item === page
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border-2 border-purple-500/70"
              : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-2 border-purple-400/50 hover:from-purple-600/40 hover:to-pink-600/40 hover:border-purple-500"
          )}
        >
          {item}
        </button>
      ))}

      {/* Show last page if not in range */}
      {endPage < pages && (
        <>
          {endPage < pages - 1 && <span className="text-white/60">...</span>}
          <button
            type="button"
            onClick={() => goToPage(pages)}
            className="w-10 h-10 rounded-2xl font-bold transition-all duration-300 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-2 border-purple-400/50 hover:from-purple-600/40 hover:to-pink-600/40 hover:border-purple-500"
          >
            {pages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page === pages}
        className="px-4 py-2 rounded-2xl border-2 border-purple-500/70 bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-sm font-bold text-white hover:from-purple-600/40 hover:to-pink-600/40 hover:border-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600/30 disabled:hover:to-pink-600/30"
      >
        Next
      </button>
    </nav>
  );
}


