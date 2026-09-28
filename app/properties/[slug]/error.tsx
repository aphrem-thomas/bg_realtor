"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { StateMessage } from "@/components/ui/StateMessage";

export default function ListingError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="container-page py-16 sm:py-24">
      <StateMessage
        headingLevel="h1"
        tone="error"
        icon={<WifiOff className="size-6" aria-hidden="true" />}
        title="We couldn't load this property"
        description="Our listing service is temporarily unavailable or slow to respond. Please try again in a moment."
        actions={
          <>
            <button type="button" onClick={() => retry()} className="btn-primary">
              Try again
            </button>
            <Link href="/contact" className="btn-secondary">
              Ask about this home
            </Link>
          </>
        }
      />
    </div>
  );
}
