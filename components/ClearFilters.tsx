"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ClearFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("price");
    params.delete("page");
    const url = params.toString() ? `/?${params.toString()}` : "/";

    // Navigate without scrolling - let browser maintain scroll position
    router.replace(url, { scroll: false });
  };

  return (
    <button
      type="button"
      onClick={handleClear}
      className="text-sm font-semibold text-purple-600 hover:text-purple-700 underline"
    >
      Clear filters
    </button>
  );
}


