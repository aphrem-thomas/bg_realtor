import { describe, expect, it } from "vitest";
import { DEFAULT_SEARCH, parseListingSearch } from "@/lib/search/params";
import { buildFilter, buildKeyFilter, buildOrderBy, odataString, toTitleCase } from "./odata";

describe("odataString", () => {
  it("escapes single quotes by doubling them", () => {
    expect(odataString("L'Orignal")).toBe("'L''Orignal'");
  });
});

describe("toTitleCase", () => {
  it("normalises place names for exact matching", () => {
    expect(toTitleCase("ottawa")).toBe("Ottawa");
    expect(toTitleCase("st. catharines")).toBe("St. Catharines");
    expect(toTitleCase("ORLÉANS")).toBe("Orléans");
    expect(toTitleCase("niagara-on-the-lake")).toBe("Niagara-On-The-Lake");
  });
});

describe("buildFilter", () => {
  it("returns undefined for an empty search", () => {
    expect(buildFilter(DEFAULT_SEARCH)).toBeUndefined();
  });

  it("combines location, category, price and room filters", () => {
    const filter = buildFilter({
      ...DEFAULT_SEARCH,
      location: "kanata",
      category: "condo",
      transaction: "sale",
      minPrice: 400_000,
      maxPrice: 700_000,
      minBeds: 2,
      minBaths: 2,
    });
    expect(filter).toBe(
      "(City eq 'Kanata' or CityRegion eq 'Kanata' or SubdivisionName eq 'Kanata') and (CommonInterest eq 'Condo/Strata') and ListPrice gt 0 and ListPrice ge 400000 and ListPrice le 700000 and BedroomsTotal ge 2 and BathroomsTotalInteger ge 2",
    );
  });

  it("filters lease listings on LeaseAmount", () => {
    expect(buildFilter({ ...DEFAULT_SEARCH, transaction: "lease", maxPrice: 3000 })).toBe("LeaseAmount gt 0 and LeaseAmount le 3000");
  });

  it("builds a date filter for recently listed homes", () => {
    const now = new Date("2026-09-27T15:00:00Z");
    expect(buildFilter({ ...DEFAULT_SEARCH, listedWithin: 7 }, now)).toBe("OriginalEntryTimestamp ge 2026-09-20T00:00:00.000Z");
  });

  it("cannot be injected through user input", () => {
    const search = parseListingSearch({ location: "x') or (ListPrice gt 0" });
    // Parentheses are stripped by the parser and quotes are escaped by the builder.
    expect(buildFilter(search)).toBe("(City eq 'X'' Or Listprice Gt 0' or CityRegion eq 'X'' Or Listprice Gt 0' or SubdivisionName eq 'X'' Or Listprice Gt 0')");
  });
});

describe("buildOrderBy / buildKeyFilter", () => {
  it("adds a stable secondary sort key", () => {
    expect(buildOrderBy("price-asc")).toBe("ListPrice asc,ListingKey asc");
    expect(buildOrderBy("newest")).toBe("OriginalEntryTimestamp desc,ListingKey asc");
  });
  it("builds an `in` filter for listing keys", () => {
    expect(buildKeyFilter(["1", "2"])).toBe("ListingKey in ('1','2')");
  });
});

describe("parseListingSearch", () => {
  it("sanitises and normalises query-string input", () => {
    const search = parseListingSearch({ minPrice: "900000", maxPrice: "500000", beds: "99", sort: "bogus", page: "abc", type: "castle" });
    expect(search).toMatchObject({ minPrice: 500000, maxPrice: 900000, minBeds: 10, sort: "newest", page: 1, category: undefined });
  });
});
