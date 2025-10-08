"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * ScrollPreserver component
 * Prevents automatic scroll restoration on navigation
 * and manually preserves scroll position during URL changes
 */
export default function ScrollPreserver() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    return () => {
      // Re-enable on unmount (optional)
      if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  useEffect(() => {
    // Save scroll position before navigation
    const handleBeforeUnload = () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("scrollPosition", String(window.scrollY));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, searchParams]);

  return null;
}
