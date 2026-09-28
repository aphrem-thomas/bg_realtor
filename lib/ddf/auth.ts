import "server-only";

import { ddfEnv } from "@/lib/env";
import { DdfError } from "./errors";

/**
 * OAuth 2.0 client-credentials flow against CREA's identity server.
 *
 *   POST https://identity.crea.ca/connect/token
 *   grant_type=client_credentials&client_id=…&client_secret=…&scope=DDFApi_Read
 *
 * Tokens last 60 minutes and are NOT sliding, so we cache the token in memory
 * and refresh it shortly before it expires. Concurrent callers share a single
 * in-flight request.
 */

type TokenResponse = { access_token: string; expires_in: number; token_type: string };

const REFRESH_MARGIN_MS = 2 * 60 * 1000;

let cached: { token: string; expiresAt: number } | null = null;
let inflight: Promise<string> | null = null;

export async function getAccessToken(): Promise<string> {
  if (cached && Date.now() < cached.expiresAt - REFRESH_MARGIN_MS) return cached.token;
  inflight ??= requestToken().finally(() => {
    inflight = null;
  });
  return inflight;
}

/** Drop the cached token (e.g. after a 401) so the next call fetches a new one. */
export function invalidateAccessToken(): void {
  cached = null;
}

async function requestToken(): Promise<string> {
  if (!ddfEnv.clientId || !ddfEnv.clientSecret) {
    throw new DdfError("config", "DDF credentials are not configured (DDF_CLIENT_ID / DDF_CLIENT_SECRET).");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: ddfEnv.clientId,
    client_secret: ddfEnv.clientSecret,
    scope: ddfEnv.scope,
  });

  let response: Response;
  try {
    response = await fetch(ddfEnv.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(ddfEnv.timeoutMs),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new DdfError(timedOut ? "timeout" : "unavailable", "DDF token request failed.", { cause: error });
  }

  if (response.status === 400 || response.status === 401 || response.status === 403) {
    // Never log the response body verbatim — keep logs free of credential echoes.
    throw new DdfError("auth", `DDF token request rejected (HTTP ${response.status}). Check credentials and that the feed is active.`, {
      status: response.status,
    });
  }
  if (!response.ok) {
    throw new DdfError("unavailable", `DDF identity server error (HTTP ${response.status}).`, { status: response.status });
  }

  const data = (await response.json()) as Partial<TokenResponse>;
  if (!data.access_token) throw new DdfError("auth", "DDF token response did not include an access_token.");

  const lifetimeMs = (Number(data.expires_in) || 3600) * 1000;
  cached = { token: data.access_token, expiresAt: Date.now() + lifetimeMs };
  return data.access_token;
}
