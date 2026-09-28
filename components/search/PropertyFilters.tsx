"use client";

import Form from "next/form";
import Link from "next/link";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { track } from "@/lib/analytics/client";
import {
  COUNT_OPTIONS,
  LISTED_WITHIN_OPTIONS,
  PRICE_OPTIONS,
  PROPERTY_CATEGORIES,
  TRANSACTION_TYPES,
  countActiveFilters,
  type ListingSearch,
} from "@/lib/search/params";
import { formatPriceCompact } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Search filters as a plain GET form (progressively enhanced by next/form).
 * The core filters are always visible; secondary ones live under "More filters"
 * to keep the UI calm.
 */
export function PropertyFilters({ search, areas }: { search: ListingSearch; areas: string[] }) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(search);
  const hasAdvanced = Boolean(search.minSqft || search.minParking || search.listedWithin || search.city || search.neighbourhood);

  return (
    <div>
      <button
        type="button"
        className="btn-secondary w-full justify-between lg:hidden"
        aria-expanded={open}
        aria-controls="property-filters"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters
          {active ? <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">{active}</span> : null}
        </span>
        <span className="text-muted">{open ? "Hide" : "Show"}</span>
      </button>

      <Form
        id="property-filters"
        action="/properties"
        aria-label="Filter properties"
        className={cn("card mt-3 space-y-5 p-5 lg:mt-0 lg:block", open ? "block" : "hidden")}
        onSubmit={(event) => {
          const data = new FormData(event.currentTarget);
          track("property_search", {
            location: String(data.get("location") || "") || undefined,
            type: String(data.get("type") || "") || undefined,
            min_price: Number(data.get("minPrice")) || undefined,
            max_price: Number(data.get("maxPrice")) || undefined,
            beds: Number(data.get("beds")) || undefined,
          });
          setOpen(false);
        }}
      >
        {/* Preserve the chosen sort order when filters change. */}
        {search.sort !== "newest" ? <input type="hidden" name="sort" value={search.sort} /> : null}

        <Field label="Location" htmlFor="f-location">
          <input
            id="f-location"
            name="location"
            list="filter-areas"
            defaultValue={search.location ?? ""}
            placeholder="City or neighbourhood"
            autoComplete="off"
            className="field-input"
          />
          <datalist id="filter-areas">
            {areas.map((area) => (
              <option key={area} value={area} />
            ))}
          </datalist>
        </Field>

        <fieldset>
          <legend className="field-label">Listing type</legend>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-paper p-1 text-sm font-medium">
            {[{ value: "", label: "All" }, ...TRANSACTION_TYPES].map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="transaction"
                  value={option.value}
                  defaultChecked={(search.transaction ?? "") === option.value}
                  className="peer sr-only"
                />
                <span className="block rounded-lg px-2 py-2 text-center text-muted transition-colors peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                  {option.label.replace("For rent / lease", "Rent")}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Property type" htmlFor="f-type">
          <select id="f-type" name="type" defaultValue={search.category ?? ""} className="field-input">
            <option value="">Any type</option>
            {PROPERTY_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <fieldset>
          <legend className="field-label">Price</legend>
          <div className="grid grid-cols-2 gap-2">
            <label className="sr-only" htmlFor="f-min-price">
              Minimum price
            </label>
            <select id="f-min-price" name="minPrice" defaultValue={search.minPrice ?? ""} className="field-input">
              <option value="">No min</option>
              {PRICE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {formatPriceCompact(p)}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="f-max-price">
              Maximum price
            </label>
            <select id="f-max-price" name="maxPrice" defaultValue={search.maxPrice ?? ""} className="field-input">
              <option value="">No max</option>
              {PRICE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {formatPriceCompact(p)}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Beds" htmlFor="f-beds">
            <select id="f-beds" name="beds" defaultValue={search.minBeds ?? ""} className="field-input">
              <option value="">Any</option>
              {COUNT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </Field>
          <Field label="Baths" htmlFor="f-baths">
            <select id="f-baths" name="baths" defaultValue={search.minBaths ?? ""} className="field-input">
              <option value="">Any</option>
              {COUNT_OPTIONS.slice(0, 4).map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>
          </Field>
        </div>

        <details className="group border-t border-line pt-4" open={hasAdvanced}>
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold [&::-webkit-details-marker]:hidden">
            More filters
            <span aria-hidden="true" className="text-lg leading-none text-muted transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-4 space-y-4">
            <Field label="City" htmlFor="f-city">
              <input id="f-city" name="city" defaultValue={search.city ?? ""} placeholder="e.g. Ottawa" className="field-input" />
            </Field>
            <Field label="Neighbourhood" htmlFor="f-neighbourhood">
              <input
                id="f-neighbourhood"
                name="neighbourhood"
                defaultValue={search.neighbourhood ?? ""}
                placeholder="e.g. Westboro"
                className="field-input"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Min. sq ft" htmlFor="f-sqft">
                <select id="f-sqft" name="minSqft" defaultValue={search.minSqft ?? ""} className="field-input">
                  <option value="">Any</option>
                  {[750, 1000, 1500, 2000, 2500, 3000].map((n) => (
                    <option key={n} value={n}>
                      {n.toLocaleString("en-CA")}+
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Parking" htmlFor="f-parking">
                <select id="f-parking" name="parking" defaultValue={search.minParking ?? ""} className="field-input">
                  <option value="">Any</option>
                  {COUNT_OPTIONS.slice(0, 4).map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Date listed" htmlFor="f-listed">
              <select id="f-listed" name="listed" defaultValue={search.listedWithin ?? ""} className="field-input">
                <option value="">Any time</option>
                {LISTED_WITHIN_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </details>

        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary flex-1">
            Search Properties
          </button>
          {active ? (
            <Link href="/properties" className="btn-ghost px-3" aria-label="Clear all filters" onClick={() => setOpen(false)}>
              <X className="size-4" aria-hidden="true" /> Clear
            </Link>
          ) : null}
        </div>
      </Form>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
      </label>
      {children}
    </div>
  );
}
