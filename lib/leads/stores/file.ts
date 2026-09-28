import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LeadRepository } from "../repository";
import type { Lead, LeadListFilter, LeadStatus, NewLead } from "../types";

/**
 * DEVELOPMENT store: persists leads to `.data/leads.json`. Zero setup, but not
 * suitable for production (no concurrency guarantees; serverless filesystems
 * are ephemeral). Use PostgreSQL in production.
 */
const FILE = path.join(process.cwd(), ".data", "leads.json");

let queue: Promise<unknown> = Promise.resolve();

/** Serialise writes within this process to avoid clobbering the file. */
function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<Lead[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Lead[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeAll(leads: Lead[]): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(leads, null, 2), "utf8");
  await rename(tmp, FILE);
}

export class FileLeadRepository implements LeadRepository {
  readonly name = "file";

  create(input: NewLead): Promise<Lead> {
    return exclusive(async () => {
      const now = new Date().toISOString();
      const lead: Lead = { ...input, id: randomUUID(), status: "NEW", createdAt: now, updatedAt: now };
      const leads = await readAll();
      leads.push(lead);
      await writeAll(leads);
      return lead;
    });
  }

  async getById(id: string): Promise<Lead | null> {
    return (await readAll()).find((lead) => lead.id === id) ?? null;
  }

  async list(filter: LeadListFilter = {}): Promise<Lead[]> {
    const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
    const offset = Math.max(filter.offset ?? 0, 0);
    return (await readAll())
      .filter((lead) => (!filter.status || lead.status === filter.status) && (!filter.source || lead.source === filter.source))
      .filter((lead) => !filter.propertyId || lead.propertyId === filter.propertyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(offset, offset + limit);
  }

  updateStatus(id: string, status: LeadStatus): Promise<Lead | null> {
    return exclusive(async () => {
      const leads = await readAll();
      const lead = leads.find((l) => l.id === id);
      if (!lead) return null;
      lead.status = status;
      lead.updatedAt = new Date().toISOString();
      await writeAll(leads);
      return lead;
    });
  }
}
