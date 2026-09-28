import Script from "next/script";

/**
 * Optional analytics providers, enabled by public env vars. Events sent with
 * `track()` (lib/analytics/client.ts) reach whichever of these is loaded.
 *
 *   NEXT_PUBLIC_GTM_ID            → Google Tag Manager (recommended: route to GA4, Meta, etc.)
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN  → Plausible Analytics
 *
 * Add further providers here. Remember to update the privacy policy.
 */
export function AnalyticsScripts() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <>
      {gtmId && /^GTM-[A-Z0-9]+$/.test(gtmId) ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      ) : null}
      {plausibleDomain ? (
        <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />
      ) : null}
    </>
  );
}
