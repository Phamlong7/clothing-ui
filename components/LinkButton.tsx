"use client";

import { useRouter } from "next/navigation";
import { startTransition, useCallback, useState } from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export default function LinkButton({ href, children, className = "", variant = "primary", size = "md" }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleClick = useCallback(() => {
    if (pending) return;
    setPending(true);
    startTransition(() => {
      router.push(href);
      setTimeout(() => setPending(false), 800);
    });
  }, [href, pending, router]);

  const base = "inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 ease-out";
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  }[size];
  const visual = variant === "primary"
    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
    : "bg-transparent text-blue-700 hover:text-blue-800 border border-blue-200 hover:bg-blue-50";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`${base} ${sizes} ${visual} ${className}`}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
          <span>Loading…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
