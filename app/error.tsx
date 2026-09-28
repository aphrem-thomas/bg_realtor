"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { StateMessage } from "@/components/ui/StateMessage";

/** Route-level error boundary. Never shows internal error details. */
export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="container-page py-16 sm:py-24">
      <StateMessage
        headingLevel="h1"
        tone="error"
        icon={<AlertTriangle className="size-6" aria-hidden="true" />}
        title="Something went wrong"
        description="We hit an unexpected problem loading this page. Please try again — if it keeps happening, reach out and we'll help directly."
        actions={
          <>
            <button type="button" onClick={() => retry()} className="btn-primary">
              Try again
            </button>
            <Link href="/" className="btn-secondary">
              Go home
            </Link>
          </>
        }
      />
    </div>
  );
}
