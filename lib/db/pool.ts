import "server-only";

import { Pool } from "pg";
import { dbEnv } from "@/lib/env";

/**
 * Shared PostgreSQL connection pool. Reused across hot reloads in development
 * and across invocations of a warm serverless function in production.
 */
const globalForDb = globalThis as unknown as { __pgPool?: Pool };

export function getPool(): Pool {
  if (!dbEnv.databaseUrl) throw new Error("DATABASE_URL is not configured.");
  globalForDb.__pgPool ??= new Pool({
    connectionString: dbEnv.databaseUrl,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: sslOption(dbEnv.databaseUrl, dbEnv.ssl),
  });
  return globalForDb.__pgPool;
}

function sslOption(url: string, mode: typeof dbEnv.ssl) {
  if (mode === "off" || /@(localhost|127\.0\.0\.1)[:/]/.test(url)) return undefined;
  return mode === "no-verify" ? { rejectUnauthorized: false } : { rejectUnauthorized: true };
}
