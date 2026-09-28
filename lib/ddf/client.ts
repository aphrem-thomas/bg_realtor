import "server-only";

import { ddfEnv } from "@/lib/env";
import { getAccessToken, invalidateAccessToken } from "./auth";
import { DdfError } from "./errors";

/**
 * Low-level HTTP client for the DDF® Web API (OData v4).
 *
 * - Adds the bearer token (and retries once with a fresh token on 401)
 * - Enforces a timeout
 * - Maps HTTP failures to typed DdfErrors
 * - Opts into the Next.js Data Cache via `revalidate` / `tags`
 */

export type DdfRequestOptions = {
  /** Seconds to keep the response in the Next.js Data Cache. 0 disables caching. */
  revalidate?: number;
  tags?: string[];
};

export type ODataQuery = Record<string, string | number | boolean | undefined>;

export function buildUrl(path: string, query: ODataQuery = {}): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    // encodeURIComponent keeps "$" readable after decoding; DDF accepts both.
    parts.push(`${key}=${encodeURIComponent(String(value))}`);
  }
  return `${ddfEnv.apiBaseUrl}/${path.replace(/^\//, "")}${parts.length ? `?${parts.join("&")}` : ""}`;
}

export async function ddfGet<T>(path: string, query: ODataQuery = {}, options: DdfRequestOptions = {}): Promise<T> {
  const url = buildUrl(path, query);
  return request<T>(url, options, true);
}

async function request<T>(url: string, options: DdfRequestOptions, allowRetry: boolean): Promise<T> {
  const token = await getAccessToken();
  const revalidate = options.revalidate ?? 300;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(ddfEnv.timeoutMs),
      ...(revalidate > 0
        ? { next: { revalidate, tags: ["ddf", ...(options.tags ?? [])] } }
        : { cache: "no-store" as const }),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new DdfError(timedOut ? "timeout" : "unavailable", `DDF request failed: ${redact(url)}`, { cause: error });
  }

  if (response.status === 401 && allowRetry) {
    invalidateAccessToken();
    return request<T>(url, options, false);
  }

  if (!response.ok) {
    const kind =
      response.status === 404
        ? "not_found"
        : response.status === 400
          ? "bad_request"
          : response.status === 401 || response.status === 403
            ? "auth"
            : response.status === 408
              ? "timeout"
              : "unavailable";
    let detail = "";
    try {
      const body = (await response.json()) as { error?: { message?: string }; message?: string };
      detail = body.error?.message ?? body.message ?? "";
    } catch {
      /* body is not JSON */
    }
    throw new DdfError(kind, `DDF HTTP ${response.status} for ${redact(url)}${detail ? ` — ${detail}` : ""}`, {
      status: response.status,
    });
  }

  return (await response.json()) as T;
}

/** Strip the query string from URLs before logging (keeps logs short; no secrets are in URLs). */
function redact(url: string): string {
  return url.split("?")[0];
}
