import "server-only";

import type { ListingSearch } from "@/lib/search/params";
import type { DdfOffice, DdfProperty } from "./types";

/**
 * A listing data source returns raw DDF-shaped records. The listings service
 * (./listings.ts) maps them to the domain model. Two implementations exist:
 *
 *   - live: the REALTOR.ca DDF® Web API (./live-source.ts)
 *   - mock: a local sample dataset for development (./mock/source.ts)
 *
 * A future implementation could read from a local replica database kept in
 * sync with DDF's replication endpoints — nothing else would need to change.
 */
export interface ListingDataSource {
  readonly name: "live" | "mock";
  search(search: ListingSearch, pageSize: number): Promise<{ records: DdfProperty[]; total: number }>;
  getByKey(key: string): Promise<DdfProperty | null>;
  getByKeys(keys: string[]): Promise<DdfProperty[]>;
  getOffice(key: string): Promise<DdfOffice | null>;
  /** Lightweight records (key + address fields) for the sitemap. */
  listForSitemap(limit: number): Promise<DdfProperty[]>;
}
