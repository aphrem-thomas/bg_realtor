"use client";

import type { AnalyticsEvent, AnalyticsEventMap } from "./events";

type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (command: "event", name: string, params?: Record<string, unknown>) => void;
  plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
  posthog?: { capture: (name: string, props?: Record<string, unknown>) => void };
};

/**
 * Dispatch an analytics event to whichever providers are installed. No
 * provider is hard-coded: add a <script> for GTM/GA4/Plausible/PostHog in
 * `components/analytics/AnalyticsScripts.tsx` and events flow automatically.
 * A DOM CustomEvent is also emitted so custom listeners can subscribe.
 */
export function track<E extends AnalyticsEvent>(event: E, props: AnalyticsEventMap[E]): void {
  if (typeof window === "undefined") return;
  const w = window as Win;
  const payload = props as Record<string, unknown>;
  try {
    w.dataLayer?.push({ event, ...payload });
    w.gtag?.("event", event, payload);
    w.plausible?.(event, { props: payload });
    w.posthog?.capture(event, payload);
    window.dispatchEvent(new CustomEvent("app:analytics", { detail: { event, props: payload } }));
    if (process.env.NODE_ENV === "development") console.debug("[analytics]", event, payload);
  } catch {
    // Analytics must never break the page.
  }
}
