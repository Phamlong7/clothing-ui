"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function ClearFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isPending, startTransition] = useTransition();

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("price");
    params.delete("page");
    const url = params.toString() ? `/?${params.toString()}` : "/";

    // Use startTransition to prevent layout shift and maintain scroll
    startTransition(() => {
      router.replace(url, { scroll: false });
    });
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


