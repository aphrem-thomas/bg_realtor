import "server-only";

import { after } from "next/server";
import { realtor } from "@/config/realtor";
import { getEmailProvider } from "@/lib/email";
import { newLeadNotification } from "@/lib/email/templates";
import { emailEnv } from "@/lib/env";
import { activeIntegrations } from "./integrations";
import { getLeadRepository } from "./repository";
import type { Lead, NewLead } from "./types";

/**
 * Lead pipeline:
 *
 *   validated input → save to store → (after response) notify realtor + CRM integrations
 *
 * If the store is unavailable we fall back to emailing the realtor
 * synchronously, so a lead is only reported as failed when BOTH paths fail.
 */

export type CreateLeadOutcome = { ok: true; lead: Lead | null } | { ok: false };

async function notifyRealtor(lead: NewLead | Lead): Promise<void> {
  const { subject, text, html } = newLeadNotification(lead);
  await getEmailProvider().send({
    to: emailEnv.notifyTo ?? realtor.email,
    subject,
    text,
    html,
    replyTo: lead.email,
  });
}

async function runIntegrations(lead: Lead): Promise<void> {
  const results = await Promise.allSettled(activeIntegrations().map((integration) => integration.send(lead)));
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[leads] integration "${activeIntegrations()[i]?.name}" failed for lead ${lead.id}`, result.reason);
    }
  });
}

export async function createLead(input: NewLead): Promise<CreateLeadOutcome> {
  let saved: Lead | null = null;
  try {
    const repository = await getLeadRepository();
    saved = await repository.create(input);
  } catch (error) {
    console.error("[leads] failed to save lead", error);
  }

  if (saved) {
    const lead = saved;
    // Run side effects after the response is sent so the visitor isn't kept waiting.
    after(async () => {
      await Promise.allSettled([
        notifyRealtor(lead).catch((error) => console.error(`[leads] notification failed for lead ${lead.id}`, error)),
        runIntegrations(lead),
      ]);
    });
    return { ok: true, lead };
  }

  // Storage failed: try to deliver the lead by email instead.
  try {
    if (getEmailProvider().name === "none") throw new Error("Email provider disabled");
    await notifyRealtor(input);
    return { ok: true, lead: null };
  } catch (error) {
    console.error("[leads] fallback notification failed; lead could not be captured", error);
    return { ok: false };
  }
}
