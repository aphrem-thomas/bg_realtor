import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { StateMessage } from "@/components/ui/StateMessage";

export default function ListingNotFound() {
  return (
    <div className="container-page py-16 sm:py-24">
      <StateMessage
        headingLevel="h1"
        icon={<HomeIcon className="size-6" aria-hidden="true" />}
        title="This listing is no longer available"
        description="The home may have sold, been taken off the market, or the link may be incorrect. Here are a few ways to keep looking."
        actions={
          <>
            <Link href="/properties" className="btn-primary">
              Browse current listings
            </Link>
            <Link href="/buy" className="btn-secondary">
              Get notified about similar homes
            </Link>
          </>
        }
      />
    </div>
  );
}
