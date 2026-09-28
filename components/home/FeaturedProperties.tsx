import Link from "next/link";
import { ArrowRight, WifiOff } from "lucide-react";
import { getFeaturedListings } from "@/lib/ddf/listings";
import { friendlyDdfMessage } from "@/lib/ddf/errors";
import type { ListingSummary } from "@/lib/ddf/types";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { StateMessage } from "@/components/ui/StateMessage";

/** Async server component — wrap in <Suspense> with a skeleton. */
export async function FeaturedProperties() {
  let listings: ListingSummary[];
  try {
    listings = await getFeaturedListings();
  } catch (error) {
    console.error("[home] featured listings failed", error);
    const { title, description } = friendlyDdfMessage(error);
    return (
      <StateMessage
        tone="error"
        icon={<WifiOff className="size-6" aria-hidden="true" />}
        title={title}
        description={description}
        actions={
          <Link href="/contact" className="btn-primary">
            Ask about available homes
          </Link>
        }
      />
    );
  }

  if (listings.length === 0) {
    return (
      <StateMessage
        title="New listings are on the way"
        description="There are no featured homes to show right now. Tell us what you're looking for and we'll send matches as they hit the market."
        actions={
          <Link href="/buy" className="btn-primary">
            Set up a home search <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
    );
  }

  return <PropertyGrid listings={listings} />;
}
