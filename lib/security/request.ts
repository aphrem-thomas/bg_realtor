import "server-only";

import { headers } from "next/headers";

/** Best-effort client IP (for rate limiting only — never stored). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Honeypot: forms include a visually hidden `website` field. Humans never fill
 * it in; naive bots do. Submissions with a value are silently discarded.
 */
export const HONEYPOT_FIELD = "website";

export function isHoneypotTripped(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === "string" && value.trim().length > 0;
}
