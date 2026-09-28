import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { StateMessage } from "@/components/ui/StateMessage";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container-page py-16 sm:py-24">
      <StateMessage
        headingLevel="h1"
        icon={<Compass className="size-6" aria-hidden="true" />}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        actions={
          <>
            <Link href="/properties" className="btn-primary">
              Browse properties
            </Link>
            <Link href="/" className="btn-secondary">
              Go home
            </Link>
          </>
        }
      />
    </div>
  );
}
