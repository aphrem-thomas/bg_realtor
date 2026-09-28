"use client";

import { Heart } from "lucide-react";
import { track } from "@/lib/analytics/client";
import { toggleSavedListing, useSavedListings } from "@/lib/favorites/store";
import { cn } from "@/lib/utils/cn";

export function FavoriteButton({
  listingKey,
  label,
  variant = "overlay",
  className,
}: {
  listingKey: string;
  label: string;
  variant?: "overlay" | "outline";
  className?: string;
}) {
  const saved = useSavedListings().includes(listingKey);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from saved homes` : `Save ${label}`}
      onClick={(event) => {
        // Cards are wrapped in links — don't navigate when saving.
        event.preventDefault();
        event.stopPropagation();
        const nowSaved = toggleSavedListing(listingKey);
        track("property_favorited", { listing_key: listingKey, saved: nowSaved });
      }}
      className={cn(
        variant === "overlay"
          ? "grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-all hover:bg-white active:scale-90"
          : "btn-secondary px-4",
        className,
      )}
    >
      <Heart
        aria-hidden="true"
        className={cn("size-5 transition-colors", saved ? "fill-danger text-danger" : "fill-transparent")}
      />
      {variant === "outline" ? <span>{saved ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
