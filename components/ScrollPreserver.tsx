"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  consumePendingScrollPosition,
  consumeScrollTarget,
  getStoredScrollPositionForRoute,
  markScrollPositionForNextNavigation,
  storeScrollPositionForRoute,
} from "@/lib/scroll";

/**
 * ScrollPreserver component
 * Prevents automatic scroll restoration on navigation
 * and manually preserves scroll position during URL changes
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ScrollPreserver() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(() => {
    const params = searchParams.toString();
    return params ? `${pathname}?${params}` : pathname;
  }, [pathname, searchParams]);

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

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return undefined;

    // If a specific scroll target is requested (e.g., #all-products), prefer it
    const targetId = consumeScrollTarget();
    if (targetId) {
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
          return;
        }
        attempts += 1;
        if (attempts < 10) {
          // Retry shortly until element mounts
          setTimeout(tryScroll, 50);
        }
      };
      tryScroll();

      return () => {
        if (typeof window === "undefined") return;
        storeScrollPositionForRoute(routeKey, window.scrollY);
      };
    }

    const pendingPosition = consumePendingScrollPosition();
    const storedForRoute = pendingPosition ?? getStoredScrollPositionForRoute(routeKey);

    if (typeof storedForRoute === "number") {
      window.scrollTo({ top: storedForRoute, behavior: "auto" });
    }

    return () => {
      if (typeof window === "undefined") return;
      storeScrollPositionForRoute(routeKey, window.scrollY);
    };
  }, [routeKey]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    // Ensure we keep the latest scroll position when the page is refreshed
    const handleBeforeUnload = () => {
      markScrollPositionForNextNavigation(routeKey);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [routeKey]);

  return null;
}
