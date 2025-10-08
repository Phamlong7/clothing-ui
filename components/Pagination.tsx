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

  // Show pagination if there are multiple pages OR if we want to show it for testing
  if (pages <= 1) {
    // For testing: show pagination even with 1 page if there are products
    return null;
  }

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }
    
    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    
    // Smooth scroll to products section
    requestAnimationFrame(() => {
      const productsSection = document.getElementById("all-products");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    
    router.replace(newUrl, { scroll: false });
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
        className="px-4 py-2 rounded-2xl border border-white/30 bg-white/10 text-sm font-semibold text-slate-100 hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {/* Show first page if not in range */}
      {startPage > 1 && (
        <>
          <button
            type="button"
            onClick={() => goToPage(1)}
            className="w-10 h-10 rounded-2xl font-semibold transition bg-white/15 text-white border border-white/20 hover:bg-white/25"
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
            "w-10 h-10 rounded-2xl font-semibold transition",
            item === page
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
              : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
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
            className="w-10 h-10 rounded-2xl font-semibold transition bg-white/15 text-white border border-white/20 hover:bg-white/25"
          >
            {pages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => goToPage(page + 1)}
        disabled={page === pages}
        className="px-4 py-2 rounded-2xl border border-white/30 bg-white/10 text-sm font-semibold text-slate-100 hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
}


