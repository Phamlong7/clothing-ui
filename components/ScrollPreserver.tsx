"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  consumePendingScrollPosition,
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
    if (typeof window === "undefined") return;

    const pending = consumePendingScrollPosition();
    const currentScroll = window.scrollY;
    let targetPosition: number | null = null;

    if (pending) {
      if (pending.routeKey && pending.routeKey !== routeKey) {
        // Keep the saved value for the intended route so it can be restored later.
        storeScrollPositionForRoute(pending.routeKey, pending.position);
      } else if (Math.abs(currentScroll - pending.position) <= 1) {
        targetPosition = pending.position;
      } else if (pending.routeKey) {
        // The user scrolled after we captured the pending value, so keep their current offset.
        storeScrollPositionForRoute(routeKey, currentScroll);
      }
    }

    if (targetPosition === null) {
      const storedForRoute = getStoredScrollPositionForRoute(routeKey);
      if (
        typeof storedForRoute === "number" &&
        Math.abs(currentScroll - storedForRoute) > 1
      ) {
        targetPosition = storedForRoute;
      }
    }

    if (typeof targetPosition === "number") {
      window.scrollTo({ top: targetPosition, behavior: "auto" });
    }

    return () => {
      if (typeof window === "undefined") return;
      storeScrollPositionForRoute(routeKey, window.scrollY);
    };
  }, [routeKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
