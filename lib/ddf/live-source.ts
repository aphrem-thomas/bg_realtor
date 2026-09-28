import "server-only";

import { complianceConfig } from "@/config/compliance";
import type { ListingSearch } from "@/lib/search/params";
import { ddfGet } from "./client";
import { SUMMARY_FIELDS } from "./constants";
import { DdfError } from "./errors";
import { buildFilter, buildKeyFilter, buildOrderBy, odataString } from "./odata";
import type { ListingDataSource } from "./source";
import type { DdfOffice, DdfProperty, ODataCollection } from "./types";

/** DDF caps $top at 100 and plain paging at 10,000 records (beyond that use replication). */
const MAX_TOP = 100;
const MAX_PAGINATION_DEPTH = 10_000;

const cacheSeconds = complianceConfig.listingCacheSeconds;

export const liveSource: ListingDataSource = {
  name: "live",

  async search(search: ListingSearch, pageSize: number) {
    const top = Math.min(pageSize, MAX_TOP);
    const skip = (search.page - 1) * top;
    if (skip >= MAX_PAGINATION_DEPTH) return { records: [], total: MAX_PAGINATION_DEPTH };

    const data = await ddfGet<ODataCollection<DdfProperty>>(
      "Property",
      {
        $filter: buildFilter(search),
        $orderby: buildOrderBy(search.sort),
        $select: SUMMARY_FIELDS.join(","),
        $top: top,
        $skip: skip || undefined,
        $count: true,
      },
      { revalidate: cacheSeconds, tags: ["ddf-search"] },
    );

    return {
      records: data.value ?? [],
      total: Math.min(data["@odata.count"] ?? data.value?.length ?? 0, MAX_PAGINATION_DEPTH),
    };
  },

  async getByKey(key: string) {
    try {
      return await ddfGet<DdfProperty>(`Property(${odataString(key)})`, {}, { revalidate: cacheSeconds, tags: [`ddf-listing-${key}`] });
    } catch (error) {
      // DDF returns 404 for unknown keys and 400 ("Invalid Primary Key") for malformed ones.
      if (error instanceof DdfError && (error.kind === "not_found" || error.kind === "bad_request")) return null;
      throw error;
    }
  },

  async getByKeys(keys: string[]) {
    if (keys.length === 0) return [];
    const data = await ddfGet<ODataCollection<DdfProperty>>(
      "Property",
      { $filter: buildKeyFilter(keys.slice(0, MAX_TOP)), $select: SUMMARY_FIELDS.join(","), $top: MAX_TOP },
      { revalidate: cacheSeconds, tags: ["ddf-search"] },
    );
    return data.value ?? [];
  },

  async getOffice(key: string) {
    try {
      return await ddfGet<DdfOffice>(
        `Office(${odataString(key)})`,
        { $select: "OfficeKey,OfficeName,OfficePhone,OfficeCity" },
        { revalidate: 86_400, tags: ["ddf-office"] },
      );
    } catch (error) {
      if (error instanceof DdfError && (error.kind === "not_found" || error.kind === "bad_request")) return null;
      throw error;
    }
  },

  async listForSitemap(limit: number) {
    const records: DdfProperty[] = [];
    const select = [
      "ListingKey",
      "StreetNumber",
      "StreetDirPrefix",
      "StreetName",
      "StreetSuffix",
      "StreetDirSuffix",
      "UnitNumber",
      "UnparsedAddress",
      "City",
      "StructureType",
      "PropertySubType",
      "CommonInterest",
      "InternetEntireListingDisplayYN",
      "InternetAddressDisplayYN",
      "ModificationTimestamp",
    ].join(",");

    for (let skip = 0; skip < Math.min(limit, MAX_PAGINATION_DEPTH); skip += MAX_TOP) {
      const data = await ddfGet<ODataCollection<DdfProperty>>(
        "Property",
        { $select: select, $orderby: "ListingKey asc", $top: MAX_TOP, $skip: skip || undefined },
        { revalidate: 3600, tags: ["ddf-sitemap"] },
      );
      records.push(...(data.value ?? []));
      if (!data["@odata.nextLink"] || (data.value?.length ?? 0) < MAX_TOP) break;
    }
    return records.slice(0, limit);
  },
};
