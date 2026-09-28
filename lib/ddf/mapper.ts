import { complianceConfig } from "@/config/compliance";
import { formatPrice } from "@/lib/utils/format";
import { buildListingSlug } from "@/lib/utils/slug";
import { PHOTO_MEDIA_CATEGORIES } from "./constants";
import type { DdfMedia, DdfProperty, Listing, ListingFeatureGroup, ListingPhoto, ListingSummary } from "./types";

/**
 * Pure transformation from raw DDF® records to the site's domain model.
 * Shared by the live and mock data sources.
 */

const clean = (value: string | null | undefined): string | null => {
  const trimmed = value?.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed : null;
};

const positive = (value: number | null | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;

const nonNegative = (value: number | null | undefined): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;

const list = (values: string[] | null | undefined): string[] =>
  Array.from(new Set((values ?? []).map((v) => clean(v)).filter((v): v is string => Boolean(v))));

/** Whether a listing may be displayed at all (InternetEntireListingDisplayYN). */
export function isDisplayable(property: DdfProperty): boolean {
  if (!complianceConfig.respectDisplayFlags) return true;
  return property.InternetEntireListingDisplayYN !== false;
}

function addressVisible(property: DdfProperty): boolean {
  if (!complianceConfig.respectDisplayFlags) return true;
  return property.InternetAddressDisplayYN !== false;
}

function streetLine(p: DdfProperty): string | null {
  const street = [p.StreetNumber, p.StreetDirPrefix, p.StreetName, p.StreetSuffix, p.StreetDirSuffix]
    .map((part) => clean(part))
    .filter(Boolean)
    .join(" ");
  if (street) return p.UnitNumber ? `${clean(p.UnitNumber)} - ${street}` : street;
  // UnparsedAddress usually contains "123 Main St, City, Province" — keep only the first part.
  return clean(p.UnparsedAddress?.split(",")[0]);
}

export function propertyTypeLabel(p: DdfProperty): string {
  const structure = clean(p.StructureType?.[0]);
  if (p.CommonInterest === "Condo/Strata") {
    if (structure && /town/i.test(structure)) return "Condo Townhouse";
    return structure && !/house/i.test(structure) ? `Condo ${structure}` : "Condo";
  }
  if (structure) return structure.replace(/^Row \/ Townhouse$/i, "Townhouse");
  return clean(p.PropertySubType) ?? "Property";
}

function httpsUrl(url: string | null | undefined): string | null {
  const value = clean(url);
  if (!value) return null;
  if (value.startsWith("//")) return `https:${value}`;
  if (!/^https?:\/\//i.test(value)) return `https://${value}`;
  return value.replace(/^http:\/\//i, "https://");
}

export function mapPhotos(media: DdfMedia[] | null | undefined): ListingPhoto[] {
  return (media ?? [])
    .filter((m) => m.MediaURL && (!m.MediaCategory || PHOTO_MEDIA_CATEGORIES.has(m.MediaCategory.toLowerCase())))
    .sort((a, b) => {
      if (a.PreferredPhotoYN && !b.PreferredPhotoYN) return -1;
      if (b.PreferredPhotoYN && !a.PreferredPhotoYN) return 1;
      return (a.Order ?? Number.MAX_SAFE_INTEGER) - (b.Order ?? Number.MAX_SAFE_INTEGER);
    })
    .map((m) => ({ url: httpsUrl(m.MediaURL)!, caption: clean(m.LongDescription) }))
    .filter((photo) => Boolean(photo.url));
}

function transactionOf(p: DdfProperty): "sale" | "lease" {
  return !positive(p.ListPrice) && positive(p.LeaseAmount ?? p.TotalActualRent) ? "lease" : "sale";
}

function livingAreaOf(p: DdfProperty): ListingSummary["livingArea"] {
  const value = positive(p.LivingArea) ?? positive(p.BuildingAreaTotal);
  if (!value) return null;
  const units = clean(positive(p.LivingArea) ? p.LivingAreaUnits : p.BuildingAreaUnits) ?? "square feet";
  return { value, units };
}

export function mapSummary(p: DdfProperty): ListingSummary {
  const visible = addressVisible(p);
  const city = clean(p.City);
  const type = propertyTypeLabel(p);
  const street = streetLine(p);
  const transaction = transactionOf(p);
  const price = transaction === "lease" ? positive(p.LeaseAmount ?? p.TotalActualRent) : positive(p.ListPrice);
  const leaseFrequency = transaction === "lease" ? (clean(p.LeaseAmountFrequency) ?? "Monthly") : null;
  const photos = mapPhotos(p.Media);
  const streetAddress = visible && street ? street : `${type}${city ? ` in ${city}` : ""}`;

  return {
    key: p.ListingKey,
    slug: buildListingSlug(visible && street ? `${street} ${city ?? ""}` : `${type} ${city ?? ""}`, p.ListingKey),
    mlsNumber: clean(p.ListingId),
    transaction,
    price,
    priceLabel:
      transaction === "lease" && price
        ? `${formatPrice(price)} / ${leaseFrequency?.toLowerCase().replace("monthly", "month") ?? "month"}`
        : formatPrice(price),
    leaseFrequency,
    addressVisible: visible,
    streetAddress,
    city,
    province: clean(p.StateOrProvince),
    neighbourhood: clean(p.CityRegion) ?? clean(p.SubdivisionName),
    propertyType: type,
    beds: nonNegative(p.BedroomsTotal),
    baths: nonNegative(p.BathroomsTotalInteger),
    livingArea: livingAreaOf(p),
    photo: photos[0] ?? null,
    photoCount: p.PhotosCount ?? photos.length,
    listedAt: clean(p.OriginalEntryTimestamp),
    status: clean(p.StandardStatus),
  };
}

const FEATURE_FIELDS: [label: string, pick: (p: DdfProperty) => string[] | null | undefined][] = [
  ["Heating", (p) => p.Heating],
  ["Cooling", (p) => p.Cooling],
  ["Basement", (p) => p.Basement],
  ["Flooring", (p) => p.Flooring],
  ["Appliances", (p) => p.Appliances],
  ["Fireplace", (p) => p.FireplaceFeatures],
  ["Parking", (p) => p.ParkingFeatures],
  ["Exterior", (p) => [...(p.ExteriorFeatures ?? []), ...(p.ConstructionMaterials ?? [])]],
  ["Roof", (p) => p.Roof],
  ["Foundation", (p) => p.FoundationDetails],
  ["Building amenities", (p) => p.BuildingFeatures],
  ["Community", (p) => p.CommunityFeatures],
  ["Pool", (p) => p.PoolFeatures],
  ["Waterfront", (p) => p.WaterfrontFeatures],
  ["View", (p) => p.View],
  ["Lot", (p) => p.LotFeatures],
  ["Fencing", (p) => p.Fencing],
  ["Accessibility", (p) => p.AccessibilityFeatures],
  ["Security", (p) => p.SecurityFeatures],
  ["Utilities", (p) => [...(p.Utilities ?? []), ...(p.WaterSource ?? []), ...(p.Sewer ?? [])]],
];

export function mapListing(p: DdfProperty): Listing {
  const summary = mapSummary(p);
  const visible = summary.addressVisible;
  const lat = p.Latitude;
  const lng = p.Longitude;
  const hasCoords =
    typeof lat === "number" && typeof lng === "number" && lat !== 0 && lng !== 0 && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

  const featureGroups: ListingFeatureGroup[] = FEATURE_FIELDS.map(([label, pick]) => ({ label, items: list(pick(p)) })).filter(
    (group) => group.items.length > 0,
  );

  const lotArea = positive(p.LotSizeArea);
  const lotDimensions = clean(p.LotSizeDimensions);

  return {
    ...summary,
    postalCode: visible ? clean(p.PostalCode) : null,
    fullAddress: [summary.streetAddress, summary.city, summary.province, visible ? clean(p.PostalCode) : null]
      .filter(Boolean)
      .join(", "),
    location: hasCoords ? { lat: lat!, lng: lng! } : null,
    ownership: clean(p.CommonInterest),
    structureTypes: list(p.StructureType),
    subType: clean(p.PropertySubType),
    bedsAboveGrade: nonNegative(p.BedroomsAboveGrade),
    bedsBelowGrade: nonNegative(p.BedroomsBelowGrade),
    bathsPartial: nonNegative(p.BathroomsPartial),
    lotSize: lotArea || lotDimensions ? { area: lotArea, units: clean(p.LotSizeUnits), dimensions: lotDimensions } : null,
    parkingTotal: nonNegative(p.ParkingTotal),
    parkingFeatures: list(p.ParkingFeatures),
    yearBuilt: positive(p.YearBuilt),
    stories: positive(p.Stories),
    description: clean(p.PublicRemarks),
    inclusions: clean(p.Inclusions),
    featureGroups,
    rooms: (p.Rooms ?? [])
      .filter((room) => clean(room.RoomType))
      .map((room) => ({
        type: clean(room.RoomType)!,
        level: clean(room.RoomLevel),
        dimensions:
          clean(room.RoomDimensions) ??
          (positive(room.RoomLength) && positive(room.RoomWidth)
            ? `${room.RoomLength} x ${room.RoomWidth}${room.RoomLengthWidthUnits ? ` ${room.RoomLengthWidthUnits}` : ""}`
            : null),
      })),
    taxes: positive(p.TaxAnnualAmount) ? { amount: p.TaxAnnualAmount!, year: positive(p.TaxYear) } : null,
    maintenanceFee: positive(p.AssociationFee)
      ? { amount: p.AssociationFee!, frequency: clean(p.AssociationFeeFrequency) }
      : null,
    photos: mapPhotos(p.Media),
    realtorCaUrl: httpsUrl(p.ListingURL),
    listOfficeKey: clean(p.ListOfficeKey),
    board: clean(p.ListAOR) ?? clean(p.OriginatingSystemName),
    updatedAt: clean(p.ModificationTimestamp),
  };
}
