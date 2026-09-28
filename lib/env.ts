import "server-only";

/**
 * Server-side environment access. Importing this module from a Client
 * Component fails the build (via `server-only`), which guarantees secrets such
 * as DDF credentials never reach the browser bundle.
 */

function str(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value.trim() : undefined;
}

function int(name: string, fallback: number): number {
  const raw = str(name);
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function oneOf<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  const raw = str(name)?.toLowerCase();
  return (allowed as readonly string[]).includes(raw ?? "") ? (raw as T) : fallback;
}

export const isProduction = process.env.NODE_ENV === "production";

// DDF feed credentials. CREA calls these the data feed "username" and
// "password"; the OAuth token endpoint expects them as client_id/client_secret.
// Either naming is accepted.
const ddfClientId = str("DDF_CLIENT_ID") ?? str("DDF_USERNAME");
const ddfClientSecret = str("DDF_CLIENT_SECRET") ?? str("DDF_PASSWORD");
const ddfModeSetting = oneOf("DDF_MODE", ["auto", "live", "mock"] as const, "auto");

export const ddfEnv = {
  clientId: ddfClientId,
  clientSecret: ddfClientSecret,
  hasCredentials: Boolean(ddfClientId && ddfClientSecret),
  /**
   * `live`  — always call DDF (errors if credentials are missing)
   * `mock`  — always use the local sample dataset
   * `auto`  — live when credentials exist, otherwise mock
   */
  mode:
    ddfModeSetting === "auto"
      ? ddfClientId && ddfClientSecret
        ? ("live" as const)
        : ("mock" as const)
      : ddfModeSetting,
  tokenUrl: str("DDF_TOKEN_URL") ?? "https://identity.crea.ca/connect/token",
  apiBaseUrl: (str("DDF_API_BASE_URL") ?? "https://ddfapi.realtor.ca/odata/v1").replace(/\/$/, ""),
  scope: str("DDF_SCOPE") ?? "DDFApi_Read",
  destinationId: str("DDF_DESTINATION_ID"),
  timeoutMs: int("DDF_TIMEOUT_MS", 10_000),
};

export const dbEnv = {
  databaseUrl: str("DATABASE_URL"),
  /** `postgres`, `file`, or `auto` (postgres when DATABASE_URL is set, else file in dev). */
  leadStore: oneOf("LEAD_STORE", ["auto", "postgres", "file"] as const, "auto"),
  /**
   * `verify` (default): TLS with certificate verification.
   * `no-verify`: TLS without verification (only for providers with self-signed certs).
   * `off`: no TLS (local development). Localhost connections never use TLS.
   */
  ssl: oneOf("DATABASE_SSL", ["verify", "no-verify", "off"] as const, "verify"),
};

export const emailEnv = {
  provider: oneOf("EMAIL_PROVIDER", ["console", "resend", "none"] as const, isProduction ? "none" : "console"),
  apiKey: str("EMAIL_API_KEY"),
  from: str("EMAIL_FROM") ?? "Website Leads <leads@example.com>",
  /** Where new-lead notifications go. Defaults to the realtor's email. */
  notifyTo: str("LEAD_NOTIFICATION_EMAIL"),
};

export const integrationsEnv = {
  webhookUrl: str("LEAD_WEBHOOK_URL"),
  webhookSecret: str("LEAD_WEBHOOK_SECRET"),
};

export const adminEnv = {
  /** Bearer token for the /api/admin/* endpoints. Endpoints are disabled when unset. */
  apiToken: str("ADMIN_API_TOKEN"),
};
