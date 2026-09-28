#!/usr/bin/env node
/**
 * Connectivity check + lookup-value explorer for the DDF® Web API.
 *
 *   npm run ddf:check      → verifies credentials, prints one sample listing summary
 *   npm run ddf:metadata   → saves $metadata XML to .data/ddf-metadata.xml and prints
 *                            the lookup values for the fields used by property-type filters
 *
 * Credentials are read from .env.local and never printed.
 */
import { mkdir, writeFile } from "node:fs/promises";

const clientId = process.env.DDF_CLIENT_ID || process.env.DDF_USERNAME;
const clientSecret = process.env.DDF_CLIENT_SECRET || process.env.DDF_PASSWORD;
const tokenUrl = process.env.DDF_TOKEN_URL || "https://identity.crea.ca/connect/token";
const apiBase = (process.env.DDF_API_BASE_URL || "https://ddfapi.realtor.ca/odata/v1").replace(/\/$/, "");
const mode = process.argv[2] ?? "check";

if (!clientId || !clientSecret) {
  console.error("Set DDF_CLIENT_ID and DDF_CLIENT_SECRET (or DDF_USERNAME / DDF_PASSWORD) in .env.local first.");
  process.exit(1);
}

const tokenRes = await fetch(tokenUrl, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret, scope: "DDFApi_Read" }),
});
if (!tokenRes.ok) {
  console.error(`✗ Token request failed (HTTP ${tokenRes.status}). Check credentials and that the data feed is active.`);
  process.exit(1);
}
const { access_token: token, expires_in: expiresIn } = await tokenRes.json();
console.log(`✓ Authenticated with CREA identity server (token valid ${expiresIn}s)`);
const headers = { Authorization: `Bearer ${token}` };

if (mode === "check") {
  const res = await fetch(`${apiBase}/Property?$top=1&$count=true&$select=ListingKey,City,ListPrice,StructureType,PropertySubType,CommonInterest`, { headers });
  if (!res.ok) {
    console.error(`✗ Property request failed (HTTP ${res.status})`);
    process.exit(1);
  }
  const data = await res.json();
  console.log(`✓ Feed contains ${data["@odata.count"] ?? "?"} listings`);
  console.log("  Sample:", JSON.stringify(data.value?.[0] ?? null));
} else {
  const res = await fetch(`${apiBase}/$metadata`, { headers });
  if (!res.ok) {
    console.error(`✗ $metadata request failed (HTTP ${res.status})`);
    process.exit(1);
  }
  const xml = await res.text();
  await mkdir(".data", { recursive: true });
  await writeFile(".data/ddf-metadata.xml", xml);
  console.log("✓ Saved .data/ddf-metadata.xml");

  // Print EnumType members for the lookups used in lib/ddf/constants.ts.
  for (const name of ["StructureType", "PropertySubType", "CommonInterest", "StandardStatus", "MediaCategory"]) {
    const match = xml.match(new RegExp(`<EnumType Name="${name}"[^>]*>([\\s\\S]*?)</EnumType>`));
    if (!match) {
      console.log(`\n${name}: (enum not found — search the XML manually)`);
      continue;
    }
    const members = [...match[1].matchAll(/<Member Name="([^"]+)"/g)].map((m) => m[1]);
    const labels = [...match[1].matchAll(/String="([^"]+)"/g)].map((m) => m[1]);
    console.log(`\n${name}:\n  ${(labels.length ? labels : members).join(" | ")}`);
  }
  console.log("\nCompare these values with CATEGORY_RULES in lib/ddf/constants.ts.");
}
