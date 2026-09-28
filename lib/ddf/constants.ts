import type { PropertyCategory } from "@/lib/search/params";
import type { DdfProperty } from "./types";

/**
 * Mapping from the site's simple property categories to DDF® filters.
 *
 * VERIFY: DDF lookup values (StructureType, PropertySubType, CommonInterest)
 * are published in the authenticated $metadata document
 * (https://ddfapi.realtor.ca/odata/v1/$metadata). The values below follow the
 * examples in CREA's documentation ("House", "Condo/Strata", …). After
 * connecting real credentials, run `npm run ddf:metadata` and adjust any value
 * that doesn't match.
 *
 * Each category has an OData filter (used against the live API) and an
 * equivalent predicate (used by the mock data source), so both modes behave
 * the same way.
 */
type CategoryRule = {
  odata: string;
  matches: (property: DdfProperty) => boolean;
};

const hasStructure = (property: DdfProperty, value: string) =>
  (property.StructureType ?? []).some((s) => s.toLowerCase() === value.toLowerCase());

export const CATEGORY_RULES: Record<PropertyCategory, CategoryRule> = {
  house: {
    odata: "StructureType/any(s: s eq 'House') and CommonInterest ne 'Condo/Strata'",
    matches: (p) => hasStructure(p, "House") && p.CommonInterest !== "Condo/Strata",
  },
  condo: {
    odata: "CommonInterest eq 'Condo/Strata'",
    matches: (p) => p.CommonInterest === "Condo/Strata",
  },
  townhouse: {
    odata: "StructureType/any(s: s eq 'Row / Townhouse')",
    matches: (p) => hasStructure(p, "Row / Townhouse"),
  },
  "multi-family": {
    odata: "PropertySubType eq 'Multi-family'",
    matches: (p) => p.PropertySubType === "Multi-family",
  },
  land: {
    odata: "PropertySubType eq 'Vacant Land'",
    matches: (p) => p.PropertySubType === "Vacant Land",
  },
};

/** Media categories treated as listing photos. */
export const PHOTO_MEDIA_CATEGORIES = new Set(["photo", "photos", "property photo"]);

/** Fields requested for search results / cards (keeps payloads small). */
export const SUMMARY_FIELDS = [
  "ListingKey",
  "ListingId",
  "StandardStatus",
  "PropertySubType",
  "StructureType",
  "CommonInterest",
  "ListPrice",
  "LeaseAmount",
  "LeaseAmountFrequency",
  "TotalActualRent",
  "UnparsedAddress",
  "StreetNumber",
  "StreetDirPrefix",
  "StreetName",
  "StreetSuffix",
  "StreetDirSuffix",
  "UnitNumber",
  "City",
  "CityRegion",
  "SubdivisionName",
  "StateOrProvince",
  "BedroomsTotal",
  "BathroomsTotalInteger",
  "LivingArea",
  "LivingAreaUnits",
  "BuildingAreaTotal",
  "BuildingAreaUnits",
  "PhotosCount",
  "Media",
  "InternetEntireListingDisplayYN",
  "InternetAddressDisplayYN",
  "OriginalEntryTimestamp",
] as const;
