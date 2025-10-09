const PENDING_SCROLL_KEY = "scroll:pending";
const ROUTE_SCROLL_PREFIX = "scroll:route:";

export type PendingScrollState = {
  position: number;
  routeKey?: string;
  capturedAt: number;
};

let inMemoryPendingScroll: PendingScrollState | null = null;
const inMemoryRoutePositions = new Map<string, number>();

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

function parsePendingScroll(value: string | null): PendingScrollState | null {
  if (value === null) return null;

  try {
    const parsed = JSON.parse(value) as unknown;

    if (typeof parsed === "number" && Number.isFinite(parsed)) {
      return { position: parsed, capturedAt: Date.now() };
    }

    if (typeof parsed === "object" && parsed !== null) {
      const maybePosition = (parsed as { position?: unknown }).position;
      const maybeRouteKey = (parsed as { routeKey?: unknown }).routeKey;
      const maybeCapturedAt = (parsed as { capturedAt?: unknown }).capturedAt;

      if (typeof maybePosition === "number" && Number.isFinite(maybePosition)) {
        return {
          position: maybePosition,
          routeKey: typeof maybeRouteKey === "string" ? maybeRouteKey : undefined,
          capturedAt:
            typeof maybeCapturedAt === "number" && Number.isFinite(maybeCapturedAt)
              ? maybeCapturedAt
              : Date.now(),
        };
      }
    }
  } catch {
    // fall through to legacy number parsing below
  }

  const legacyNumber = Number(value);
  return Number.isFinite(legacyNumber)
    ? { position: legacyNumber, capturedAt: Date.now() }
    : null;
}

export function markScrollPositionForNextNavigation(nextRouteKey?: string): void {
  if (typeof window === "undefined") return;
  const position = window.scrollY;
  const pendingState: PendingScrollState = {
    position,
    routeKey: nextRouteKey,
    capturedAt: Date.now(),
  };
  inMemoryPendingScroll = pendingState;

  if (nextRouteKey) {
    storeScrollPositionForRoute(nextRouteKey, position);
  }

  if (isBrowser()) {
    safeSetItem(PENDING_SCROLL_KEY, JSON.stringify(pendingState));
  }
}

export function consumePendingScrollPosition(): PendingScrollState | null {
  let value: PendingScrollState | null = null;

  if (isBrowser()) {
    value = parsePendingScroll(safeGetItem(PENDING_SCROLL_KEY));
    safeRemoveItem(PENDING_SCROLL_KEY);
  }

  if (value === null && inMemoryPendingScroll !== null) {
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
