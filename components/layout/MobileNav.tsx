"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Mail, Menu, Phone, X } from "lucide-react";
import { mainNav } from "@/config/site";
import type { RealtorContact } from "@/config/realtor";
import { track } from "@/lib/analytics/client";
import { cn } from "@/lib/utils/cn";

/** Full-screen mobile menu built on the native <dialog> element (focus trap + Esc for free). */
export function MobileNav({ contact }: { contact: RealtorContact }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Close the menu after navigating (state adjusted during render, not in an effect).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="btn-ghost -mr-2 px-3 lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 backdrop:bg-ink/40 lg:hidden"
      >
        <div className="flex h-full flex-col px-4 pt-4 pb-8 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted">Menu</span>
            <button type="button" className="btn-ghost -mr-2 px-3" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile" className="mt-6">
            <ul className="divide-y divide-line border-y border-line">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between py-4 text-2xl font-semibold tracking-tight",
                      pathname.startsWith(item.href) ? "text-accent" : "text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/saved" className="flex items-center gap-2 py-4 text-lg font-medium text-ink-soft">
                  <Heart className="size-5" aria-hidden="true" /> Saved homes
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-auto space-y-3">
            <Link href="/eligibility" className="btn-primary w-full">
              Check my eligibility
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={contact.phoneHref}
                className="btn-secondary"
                onClick={() => track("realtor_phone_clicked", { location: "mobile_nav" })}
              >
                <Phone className="size-4" aria-hidden="true" /> Call
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="btn-secondary"
                onClick={() => track("realtor_email_clicked", { location: "mobile_nav" })}
              >
                <Mail className="size-4" aria-hidden="true" /> Email
              </a>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
