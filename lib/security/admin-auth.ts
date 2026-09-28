import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { adminEnv } from "@/lib/env";

/**
 * Minimal bearer-token guard for the admin API. It is a stopgap until a real
 * admin dashboard with user accounts (e.g. Auth.js / Clerk) is added.
 * Returns false when ADMIN_API_TOKEN is not configured (endpoints disabled).
 */
export function isAdminRequest(request: Request): boolean {
  const expected = adminEnv.apiToken;
  if (!expected || expected.length < 24) return false;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  // Hash both sides so the comparison is constant-time regardless of length.
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
