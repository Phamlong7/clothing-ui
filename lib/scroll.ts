const PENDING_SCROLL_KEY = "scroll:pending";
const ROUTE_SCROLL_PREFIX = "scroll:route:";
const SCROLL_TARGET_KEY = "scroll:target";

let inMemoryPendingScroll: number | null = null;
const inMemoryRoutePositions = new Map<string, number>();
let inMemoryScrollTarget: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function safeSetItem(key: string, value: string): boolean {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeGetItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeRemoveItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function parseScroll(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function markScrollPositionForNextNavigation(nextRouteKey?: string): void {
  if (typeof window === "undefined") return;
  const position = window.scrollY;
  inMemoryPendingScroll = position;

  if (nextRouteKey) {
    storeScrollPositionForRoute(nextRouteKey, position);
  }

  if (isBrowser()) {
    safeSetItem(PENDING_SCROLL_KEY, String(position));
  }
}

export function markScrollTarget(targetElementId: string): void {
  if (!targetElementId) return;
  inMemoryScrollTarget = targetElementId;
  if (isBrowser()) {
    safeSetItem(SCROLL_TARGET_KEY, targetElementId);
  }
}

export function consumeScrollTarget(): string | null {
  let value: string | null = null;
  if (isBrowser()) {
    value = safeGetItem(SCROLL_TARGET_KEY);
    safeRemoveItem(SCROLL_TARGET_KEY);
  }
  if (value === null && inMemoryScrollTarget) {
    value = inMemoryScrollTarget;
  }
  inMemoryScrollTarget = null;
  return value;
}

export function consumePendingScrollPosition(): number | null {
  let value: number | null = null;

  if (isBrowser()) {
    value = parseScroll(safeGetItem(PENDING_SCROLL_KEY));
    safeRemoveItem(PENDING_SCROLL_KEY);
  }

  if (value === null && typeof inMemoryPendingScroll === "number") {
    value = inMemoryPendingScroll;
  }

  inMemoryPendingScroll = null;
  return value;
}

export function storeScrollPositionForRoute(routeKey: string, position: number): void {
  inMemoryRoutePositions.set(routeKey, position);

  if (isBrowser()) {
    safeSetItem(`${ROUTE_SCROLL_PREFIX}${routeKey}`, String(position));
  }
}

export function getStoredScrollPositionForRoute(routeKey: string): number | null {
  if (isBrowser()) {
    const stored = parseScroll(safeGetItem(`${ROUTE_SCROLL_PREFIX}${routeKey}`));
    if (typeof stored === "number") {
      inMemoryRoutePositions.set(routeKey, stored);
      return stored;
    }
  }

  return inMemoryRoutePositions.get(routeKey) ?? null;
}
