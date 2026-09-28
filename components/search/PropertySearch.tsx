"use client";

import Form from "next/form";
import { Building2, CircleDollarSign, BedDouble, MapPin, Search } from "lucide-react";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics/client";
import { COUNT_OPTIONS, PRICE_OPTIONS, PROPERTY_CATEGORIES } from "@/lib/search/params";
import { formatPriceCompact } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Hero search. A GET form to /properties via next/form: works without
 * JavaScript, and with JS it navigates client-side and prefetches results.
 */
export function PropertySearch({ areas, className }: { areas: string[]; className?: string }) {
  return (
    <Form
      action="/properties"
      role="search"
      aria-label="Search properties"
      className={cn(
        "rounded-[1.75rem] bg-surface p-2 shadow-[var(--shadow-float)] ring-1 ring-line/60",
        "grid grid-cols-2 gap-1 lg:grid-cols-[1.5fr_1.1fr_1.1fr_0.9fr_auto] lg:items-center",
        className,
      )}
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget);
        track("property_search", {
          location: String(data.get("location") || "") || undefined,
          type: String(data.get("type") || "") || undefined,
          max_price: Number(data.get("maxPrice")) || undefined,
          beds: Number(data.get("beds")) || undefined,
        });
      }}
    >
      <Segment icon={<MapPin />} label="Location" htmlFor="hero-location" className="col-span-2 lg:col-span-1">
        <input
          id="hero-location"
          name="location"
          type="text"
          list="hero-areas"
          autoComplete="off"
          placeholder="City or neighbourhood"
          className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted"
        />
        <datalist id="hero-areas">
          {areas.map((area) => (
            <option key={area} value={area} />
          ))}
        </datalist>
      </Segment>

      <Segment icon={<Building2 />} label="Property type" htmlFor="hero-type">
        <select id="hero-type" name="type" defaultValue="" className={selectClass}>
          <option value="">Any type</option>
          {PROPERTY_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Segment>

      <Segment icon={<CircleDollarSign />} label="Max price" htmlFor="hero-price">
        <select id="hero-price" name="maxPrice" defaultValue="" className={selectClass}>
          <option value="">No max</option>
          {PRICE_OPTIONS.map((price) => (
            <option key={price} value={price}>
              {formatPriceCompact(price)}
            </option>
          ))}
        </select>
      </Segment>

      <Segment icon={<BedDouble />} label="Bedrooms" htmlFor="hero-beds" className="col-span-2 sm:col-span-1">
        <select id="hero-beds" name="beds" defaultValue="" className={selectClass}>
          <option value="">Any</option>
          {COUNT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}+ beds
            </option>
          ))}
        </select>
      </Segment>

      <button type="submit" className="btn-primary col-span-2 min-h-14 rounded-[1.25rem] px-7 text-base sm:col-span-1 lg:col-span-1">
        <Search className="size-5" aria-hidden="true" />
        Search Properties
      </button>
    </Form>
  );
}

const selectClass =
  "w-full cursor-pointer appearance-none bg-transparent pr-4 text-sm font-semibold text-ink outline-none";

function Segment({
  icon,
  label,
  htmlFor,
  children,
  className,
}: {
  icon: ReactNode;
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-[1.25rem] px-4 py-2 transition-colors focus-within:bg-paper hover:bg-paper",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-ink-soft [&>svg]:size-4" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <label htmlFor={htmlFor} className="block text-[11px] font-medium text-muted">
          {label}
        </label>
        {children}
      </div>
    </div>
  );
}
