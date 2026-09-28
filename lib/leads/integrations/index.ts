import "server-only";

import { createHmac } from "node:crypto";
import { integrationsEnv } from "@/lib/env";
import type { Lead } from "../types";

/**
 * Outbound lead integrations (CRM, marketing automation, Zapier/Make, …).
 *
 * Each integration receives every saved lead. To add a CRM:
 *   1. Implement `LeadIntegration` (e.g. `hubspot.ts` calling the HubSpot
 *      Contacts API, or `mailchimp.ts` adding a list member when
 *      `lead.marketingConsent` is true).
 *   2. Add it to `activeIntegrations()` behind its own env configuration.
 *
 * The app is never coupled to a single CRM: the generic webhook below already
 * works with Zapier, Make, n8n, HubSpot workflows, Follow Up Boss, etc.
 */
export interface LeadIntegration {
  readonly name: string;
  send(lead: Lead): Promise<void>;
}

/**
 * POSTs the lead as JSON. When LEAD_WEBHOOK_SECRET is set, the body is signed
 * with HMAC-SHA256 in the `X-Signature` header so the receiver can verify it.
 */
function webhookIntegration(url: string, secret?: string): LeadIntegration {
  return {
    name: "webhook",
    async send(lead) {
      const body = JSON.stringify({ event: "lead.created", lead });
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (secret) headers["X-Signature"] = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
      const response = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error(`Webhook responded with HTTP ${response.status}`);
    },
  };
}

export function activeIntegrations(): LeadIntegration[] {
  const integrations: LeadIntegration[] = [];
  if (integrationsEnv.webhookUrl) integrations.push(webhookIntegration(integrationsEnv.webhookUrl, integrationsEnv.webhookSecret));
  return integrations;
}
