import "server-only";

import { dbEnv, isProduction } from "@/lib/env";
import type { Lead, LeadListFilter, LeadStatus, NewLead } from "./types";

/**
 * Storage abstraction for leads. Swap implementations without touching the
 * rest of the app (e.g. add a Supabase, DynamoDB or CRM-as-database store).
 */
export interface LeadRepository {
  readonly name: string;
  create(lead: NewLead): Promise<Lead>;
  getById(id: string): Promise<Lead | null>;
  list(filter?: LeadListFilter): Promise<Lead[]>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead | null>;
}

let repository: Promise<LeadRepository> | null = null;

export function getLeadRepository(): Promise<LeadRepository> {
  repository ??= createRepository();
  return repository;
}

async function createRepository(): Promise<LeadRepository> {
  const store = dbEnv.leadStore === "auto" ? (dbEnv.databaseUrl ? "postgres" : "file") : dbEnv.leadStore;

  if (store === "postgres") {
    if (!dbEnv.databaseUrl) throw new Error("LEAD_STORE=postgres but DATABASE_URL is not set.");
    const { PostgresLeadRepository } = await import("./stores/postgres");
    return new PostgresLeadRepository();
  }

  if (isProduction && dbEnv.leadStore !== "file") {
    // Serverless filesystems are ephemeral — refuse to silently lose leads.
    throw new Error("No lead database configured. Set DATABASE_URL (recommended) or LEAD_STORE=file explicitly.");
  }
  const { FileLeadRepository } = await import("./stores/file");
  return new FileLeadRepository();
}
