import { siteConfig } from "@/config/site";
import { LEAD_SOURCE_LABELS, type Lead, type NewLead } from "@/lib/leads/types";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function rows(lead: NewLead | Lead): [string, string][] {
  const out: [string, string][] = [
    ["Source", LEAD_SOURCE_LABELS[lead.source]],
    ["Name", lead.name],
    ["Email", lead.email],
  ];
  if (lead.phone) out.push(["Phone", lead.phone]);
  if (lead.details.preferredContact) out.push(["Preferred contact", lead.details.preferredContact]);
  if (lead.details.reason) out.push(["Reason", lead.details.reason]);
  if (lead.propertyAddress) out.push(["Property", lead.propertyAddress]);
  if (lead.propertyId) out.push(["Listing key", lead.propertyId]);
  if (lead.propertyUrl) out.push(["Listing URL", lead.propertyUrl]);
  if (lead.details.preferredViewingTime) out.push(["Preferred viewing time", lead.details.preferredViewingTime]);

  const seller = lead.details.seller;
  if (seller) {
    out.push(["Home address", seller.propertyAddress]);
    if (seller.propertyType) out.push(["Property type", seller.propertyType]);
    if (seller.bedrooms != null) out.push(["Bedrooms", String(seller.bedrooms)]);
    if (seller.bathrooms != null) out.push(["Bathrooms", String(seller.bathrooms)]);
    if (seller.timeline) out.push(["Timeline", seller.timeline]);
  }

  const buyer = lead.details.buyer;
  if (buyer) {
    if (buyer.timeline) out.push(["Timeline", buyer.timeline]);
    if (buyer.budget) out.push(["Budget", buyer.budget]);
    if (buyer.areas) out.push(["Areas", buyer.areas]);
    if (buyer.preApproved) out.push(["Pre-approved", buyer.preApproved]);
  }

  const eligibility = lead.details.eligibility;
  if (eligibility) {
    const result = eligibility.result as { lowPrice?: number; highPrice?: number; tier?: string };
    const input = eligibility.input as Record<string, unknown>;
    const money = (v: unknown) => (typeof v === "number" ? `$${Math.round(v).toLocaleString("en-CA")}` : "—");
    out.push(["Estimated range", `${money(result.lowPrice)} – ${money(result.highPrice)} (${result.tier ?? "n/a"})`]);
    out.push(["Household income", money(input.annualIncome)]);
    out.push(["Down payment", money(input.downPayment)]);
    out.push(["Monthly debts", money(input.monthlyDebts)]);
    out.push(["Credit score", String(input.creditScore ?? "—")]);
    out.push(["Employment", String(input.employmentType ?? "—")]);
    out.push(["First-time buyer", input.firstTimeBuyer ? "Yes" : "No"]);
    if (input.desiredPrice) out.push(["Desired price", money(input.desiredPrice)]);
  }

  out.push(["Marketing consent", lead.marketingConsent ? "Yes" : "No"]);
  if (lead.attribution.pageUrl) out.push(["Submitted from", lead.attribution.pageUrl]);
  if (lead.attribution.utmSource) out.push(["UTM", [lead.attribution.utmSource, lead.attribution.utmMedium, lead.attribution.utmCampaign].filter(Boolean).join(" / ")]);
  return out;
}

export function newLeadNotification(lead: NewLead | Lead) {
  const subject = `New lead: ${LEAD_SOURCE_LABELS[lead.source]} — ${lead.name}`;
  const table = rows(lead);
  const text = [
    `New ${LEAD_SOURCE_LABELS[lead.source].toLowerCase()} from ${siteConfig.name}`,
    "",
    ...table.map(([k, v]) => `${k}: ${v}`),
    ...(lead.message ? ["", "Message:", lead.message] : []),
    "",
    "Reply to this email to respond directly to the lead.",
  ].join("\n");

  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#111;line-height:1.5">
<h2 style="margin:0 0 12px">${escapeHtml(subject)}</h2>
<table cellpadding="6" style="border-collapse:collapse">${table
    .map(
      ([k, v]) =>
        `<tr><td style="color:#666;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
${lead.message ? `<h3 style="margin:16px 0 4px">Message</h3><p style="white-space:pre-wrap;margin:0">${escapeHtml(lead.message)}</p>` : ""}
<p style="color:#666;font-size:13px;margin-top:24px">Reply to this email to respond directly to the lead.</p>
</body></html>`;

  return { subject, text, html };
}
