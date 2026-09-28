import { Bath, BedDouble, CalendarDays, Car, Hash, Home, LandPlot, Layers, Ruler } from "lucide-react";
import type { ReactNode } from "react";
import type { Listing } from "@/lib/ddf/types";
import { formatArea, formatCurrency, formatDate } from "@/lib/utils/format";

/** Key facts strip + detailed facts table for a listing. */
export function PropertyHighlights({ listing }: { listing: Listing }) {
  const area = listing.livingArea ? formatArea(listing.livingArea.value, listing.livingArea.units) : null;
  const items: { icon: ReactNode; label: string; value: string }[] = [];
  if (listing.beds != null)
    items.push({
      icon: <BedDouble />,
      label: "Bedrooms",
      value:
        listing.bedsAboveGrade != null && listing.bedsBelowGrade
          ? `${listing.bedsAboveGrade} + ${listing.bedsBelowGrade}`
          : String(listing.beds),
    });
  if (listing.baths != null)
    items.push({
      icon: <Bath />,
      label: "Bathrooms",
      value: listing.bathsPartial ? `${listing.baths} (${listing.bathsPartial} partial)` : String(listing.baths),
    });
  if (area) items.push({ icon: <Ruler />, label: "Living area", value: area });
  if (listing.parkingTotal != null) items.push({ icon: <Car />, label: "Parking", value: String(listing.parkingTotal) });
  if (!area && listing.lotSize?.area)
    items.push({ icon: <LandPlot />, label: "Lot size", value: formatArea(listing.lotSize.area, listing.lotSize.units) ?? "" });

  if (items.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.slice(0, 4).map((item) => (
        <div key={item.label} className="rounded-2xl bg-surface p-4 ring-1 ring-line/70">
          <dt className="flex items-center gap-2 text-xs text-muted [&>svg]:size-4">
            {item.icon}
            {item.label}
          </dt>
          <dd className="mt-1.5 text-lg font-bold tracking-tight">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PropertyFactsTable({ listing, showMlsNumber }: { listing: Listing; showMlsNumber: boolean }) {
  const lot = listing.lotSize
    ? [listing.lotSize.area ? formatArea(listing.lotSize.area, listing.lotSize.units) : null, listing.lotSize.dimensions]
        .filter(Boolean)
        .join(" · ")
    : null;

  const rows: [ReactNode, string, string | null][] = [
    [<Home key="i" />, "Property type", [listing.propertyType, listing.subType && listing.subType !== listing.propertyType ? listing.subType : null].filter(Boolean).join(" · ")],
    [<Layers key="i" />, "Ownership", listing.ownership],
    [<CalendarDays key="i" />, "Year built", listing.yearBuilt ? String(listing.yearBuilt) : null],
    [<Layers key="i" />, "Storeys", listing.stories ? String(listing.stories) : null],
    [<LandPlot key="i" />, "Lot size", lot || null],
    [<Car key="i" />, "Parking", [listing.parkingTotal != null ? `${listing.parkingTotal} spaces` : null, listing.parkingFeatures.join(", ") || null].filter(Boolean).join(" · ") || null],
    [<Hash key="i" />, "Annual taxes", listing.taxes ? `${formatCurrency(listing.taxes.amount)}${listing.taxes.year ? ` (${listing.taxes.year})` : ""}` : null],
    [
      <Hash key="i" />,
      "Maintenance fee",
      listing.maintenanceFee ? `${formatCurrency(listing.maintenanceFee.amount)}${listing.maintenanceFee.frequency ? ` / ${listing.maintenanceFee.frequency.toLowerCase()}` : ""}` : null,
    ],
    [<CalendarDays key="i" />, "Listed", formatDate(listing.listedAt)],
    [<Hash key="i" />, "Status", listing.status],
    [<Hash key="i" />, "MLS® number", showMlsNumber ? listing.mlsNumber : null],
  ];

  return (
    <dl className="grid gap-x-10 sm:grid-cols-2">
      {rows
        .filter(([, , value]) => Boolean(value))
        .map(([icon, label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 border-b border-line py-3.5 text-sm">
            <dt className="flex items-center gap-2.5 text-muted [&>svg]:size-4 [&>svg]:shrink-0">
              {icon}
              {label}
            </dt>
            <dd className="text-right font-medium text-ink">{value}</dd>
          </div>
        ))}
    </dl>
  );
}
