/* Lightweight HTTP wrapper to add correlation id, auth, and ProblemDetails parsing */

import { getAuthToken } from "@/lib/api";

export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  correlationId?: string;
  errors?: Record<string, string[]>;
};

export type HttpError =
  | { kind: "validation"; problem: ProblemDetails; correlationId?: string }
  | { kind: "unauthorized"; problem?: ProblemDetails; correlationId?: string }
  | { kind: "not_found"; problem?: ProblemDetails; correlationId?: string }
  | { kind: "problem"; problem: ProblemDetails; correlationId?: string }
  | { kind: "unknown"; status?: number; body?: string; correlationId?: string };

// Simple unauthorized listeners
type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();
export function onUnauthorized(listener: Listener) {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}
function emitUnauthorized() {
  for (const l of unauthorizedListeners) l();
}

export function newCorrelationId(): string {
  try {
    // Prefer native UUID when available in the runtime
    if (typeof crypto !== "undefined" && (crypto as unknown as { randomUUID?: () => string }).randomUUID) {
      return (crypto as unknown as { randomUUID: () => string }).randomUUID();
    }
  } catch {}
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function fetchJson(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!headers.has("X-Correlation-Id")) headers.set("X-Correlation-Id", newCorrelationId());

  const token = getAuthToken?.();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers, cache: "no-store" });
  const correlationId = headers.get("X-Correlation-Id") || undefined;
  return { res, correlationId } as const;
}

export async function handleResponse<T = unknown>(res: Response, correlationId?: string): Promise<T> {
  if (res.ok) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return (await res.json()) as T;
    return undefined as unknown as T;
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/problem+json") || ct.includes("application/json")) {
    const problem = (await res.json()) as ProblemDetails;
    const cid = problem.correlationId || correlationId || res.headers.get("X-Correlation-Id") || undefined;

    if (res.status === 400 && problem.errors) throw { kind: "validation", problem, correlationId: cid } satisfies HttpError;
    if (res.status === 401) {
      emitUnauthorized();
      throw { kind: "unauthorized", problem, correlationId: cid } satisfies HttpError;
    }
    if (res.status === 404) throw { kind: "not_found", problem, correlationId: cid } satisfies HttpError;
    throw { kind: "problem", problem, correlationId: cid } satisfies HttpError;
  }

  const body = await res.text().catch(() => "");
  if (res.status === 401) emitUnauthorized();
  throw { kind: "unknown", status: res.status, body, correlationId } satisfies HttpError;
}


