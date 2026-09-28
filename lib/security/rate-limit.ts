import "server-only";

/**
 * Simple in-memory sliding-window rate limiter for form submissions.
 *
 * Limits are per server instance. On multi-instance/serverless deployments,
 * replace with a shared store (e.g. Upstash Redis `@upstash/ratelimit`) — the
 * `rateLimit()` signature can stay the same.
 */
const buckets = new Map<string, number[]>();
const MAX_KEYS = 10_000;

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }): { allowed: boolean } {
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return { allowed: false };
  }
  recent.push(now);
  buckets.set(key, recent);

  if (buckets.size > MAX_KEYS) {
    // Opportunistic cleanup to bound memory.
    for (const [k, times] of buckets) if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return { allowed: true };
}
