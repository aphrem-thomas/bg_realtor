"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SORT_OPTIONS, type SortOption } from "@/lib/search/params";

export function SortSelect({ value }: { value: SortOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm whitespace-nowrap text-muted">
        Sort by
      </label>
      <select
        id="sort"
        value={value}
        disabled={pending}
        onChange={(event) => {
          const next = new URLSearchParams(params.toString());
          if (event.target.value === "newest") next.delete("sort");
          else next.set("sort", event.target.value);
          next.delete("page");
          const query = next.toString();
          startTransition(() => router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false }));
        }}
        className="field-input min-h-10 w-auto rounded-full py-1.5 pr-9 pl-4 font-medium"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
