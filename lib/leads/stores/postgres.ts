import "server-only";

import { getPool } from "@/lib/db/pool";
import type { LeadRepository } from "../repository";
import type { Lead, LeadListFilter, LeadStatus, NewLead } from "../types";

type LeadRow = {
  id: string;
  source: Lead["source"];
  status: Lead["status"];
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  property_id: string | null;
  property_address: string | null;
  property_url: string | null;
  details: Lead["details"];
  marketing_consent: boolean;
  attribution: Lead["attribution"];
  created_at: Date;
  updated_at: Date;
};

const COLUMNS =
  "id, source, status, name, email, phone, message, property_id, property_address, property_url, details, marketing_consent, attribution, created_at, updated_at";

function toLead(row: LeadRow): Lead {
  return {
    id: row.id,
    source: row.source,
    status: row.status,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    propertyId: row.property_id,
    propertyAddress: row.property_address,
    propertyUrl: row.property_url,
    details: row.details ?? {},
    marketingConsent: row.marketing_consent,
    attribution: row.attribution ?? {},
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

/** PostgreSQL store. Schema: db/migrations/*.sql (run `npm run db:migrate`). */
export class PostgresLeadRepository implements LeadRepository {
  readonly name = "postgres";

  async create(lead: NewLead): Promise<Lead> {
    const { rows } = await getPool().query<LeadRow>(
      `INSERT INTO leads (source, name, email, phone, message, property_id, property_address, property_url, details, marketing_consent, attribution)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${COLUMNS}`,
      [
        lead.source,
        lead.name,
        lead.email,
        lead.phone,
        lead.message,
        lead.propertyId,
        lead.propertyAddress,
        lead.propertyUrl,
        JSON.stringify(lead.details),
        lead.marketingConsent,
        JSON.stringify(lead.attribution),
      ],
    );
    return toLead(rows[0]);
  }

  async getById(id: string): Promise<Lead | null> {
    const { rows } = await getPool().query<LeadRow>(`SELECT ${COLUMNS} FROM leads WHERE id = $1`, [id]);
    return rows[0] ? toLead(rows[0]) : null;
  }

  async list(filter: LeadListFilter = {}): Promise<Lead[]> {
    const where: string[] = [];
    const values: unknown[] = [];
    if (filter.status) where.push(`status = $${values.push(filter.status)}`);
    if (filter.source) where.push(`source = $${values.push(filter.source)}`);
    if (filter.propertyId) where.push(`property_id = $${values.push(filter.propertyId)}`);
    const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
    const offset = Math.max(filter.offset ?? 0, 0);

    const { rows } = await getPool().query<LeadRow>(
      `SELECT ${COLUMNS} FROM leads ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY created_at DESC LIMIT $${values.push(limit)} OFFSET $${values.push(offset)}`,
      values,
    );
    return rows.map(toLead);
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead | null> {
    const { rows } = await getPool().query<LeadRow>(
      `UPDATE leads SET status = $2, updated_at = now() WHERE id = $1 RETURNING ${COLUMNS}`,
      [id, status],
    );
    return rows[0] ? toLead(rows[0]) : null;
  }
}
