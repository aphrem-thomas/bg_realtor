"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyGridSkeleton } from "@/components/ui/Skeleton";
import { StateMessage } from "@/components/ui/StateMessage";
import type { ListingSummary } from "@/lib/ddf/types";
import { useSavedListings } from "@/lib/favorites/store";

type LoadState = { status: "loading" } | { status: "ready"; listings: ListingSummary[] } | { status: "error" };

export function SavedListings() {
  const keys = useSavedListings();
  const query = keys.join(",");
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    fetch(`/api/properties?keys=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { listings: ListingSummary[] }) => setState({ status: "ready", listings: data.listings }))
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setState({ status: "error" });
      });
    return () => controller.abort();
  }, [query]);

  if (!query) {
    return (
      <StateMessage
        icon={<Heart className="size-6" aria-hidden="true" />}
        title="No saved homes yet"
        description="Tap the heart on any listing to keep it here for later."
        actions={
          <Link href="/properties" className="btn-primary">
            Browse properties
          </Link>
        }
      />
    );
  }

  if (state.status === "loading") return <PropertyGridSkeleton count={Math.min(keys.length, 6)} />;

  if (state.status === "error") {
    return (
      <StateMessage
        tone="error"
        title="We couldn't load your saved homes"
        description="The listing service may be temporarily unavailable. Please try again shortly."
      />
    );
  }

  // Hide homes the visitor un-saved since loading; note ones that are no longer listed.
  const visible = state.listings.filter((l) => keys.includes(l.key));
  const missing = keys.length - state.listings.length;

  return (
    <>
      {visible.length ? <PropertyGrid listings={visible} /> : null}
      {missing > 0 ? (
        <p className="mt-8 text-sm text-muted">
          {missing} saved {missing === 1 ? "home is" : "homes are"} no longer available — {missing === 1 ? "it has" : "they have"} likely sold or
          been removed from the market.
        </p>
      ) : null}
    </>
  );
}
