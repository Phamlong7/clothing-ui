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

  if (pages <= 1) return null;

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

  const items = Array.from({ length: pages }, (_, idx) => idx + 1);

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


