import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

export function SuccessPanel({ title, message, children }: { title: string; message?: string; children?: ReactNode }) {
  return (
    <div role="status" className="animate-fade-in rounded-2xl bg-accent-soft p-6 text-center sm:p-8">
      <CheckCircle2 className="mx-auto size-10 text-accent" aria-hidden="true" />
      <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
      {message ? <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{message}</p> : null}
      {children ?? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/properties" className="btn-secondary">
            Keep browsing
          </Link>
          <Link href="/eligibility" className="btn-primary">
            Check affordability
          </Link>
        </div>
      )}
    </div>
  );
}
