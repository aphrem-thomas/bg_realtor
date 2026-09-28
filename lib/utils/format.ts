const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-CA", { maximumFractionDigits: 0 });

export function formatPrice(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "Price on request";
  return currencyFormatter.format(value);
}

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Math.round(value));
}

/** Compact price for tight spaces, e.g. $1.25M or $849K. */
export function formatPriceCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2).replace(/\.?0+$/, "")}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return numberFormatter.format(value);
}

export function formatArea(value: number | null | undefined, units?: string | null): string | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return `${numberFormatter.format(value)} ${abbreviateUnits(units)}`;
}

export function abbreviateUnits(units?: string | null): string {
  const u = (units ?? "").toLowerCase();
  if (u.includes("feet") || u === "sqft" || u === "sf") return "sq ft";
  if (u.includes("met")) return "m²";
  if (u.includes("acre")) return "acres";
  if (u.includes("hect")) return "ha";
  return units ?? "sq ft";
}

export function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export function daysSince(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000));
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
