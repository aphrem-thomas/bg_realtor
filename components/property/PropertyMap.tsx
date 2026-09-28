import { MapPin } from "lucide-react";

/**
 * Lightweight, key-free map using an OpenStreetMap embed (lazy-loaded iframe,
 * no JS bundle cost). When the listing hides its address, the map shows only
 * the general area with no pin.
 *
 * To use Google Maps instead, set NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY (an Embed
 * API key — public by design; restrict it to your domain in Google Cloud).
 */
export function PropertyMap({
  location,
  exact,
  label,
}: {
  location: { lat: number; lng: number };
  exact: boolean;
  label: string;
}) {
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  // Approximate: round coordinates (~1 km) and zoom out when the address is withheld.
  const lat = exact ? location.lat : Math.round(location.lat * 100) / 100;
  const lng = exact ? location.lng : Math.round(location.lng * 100) / 100;
  const span = exact ? 0.008 : 0.04;

  const src = googleKey
    ? `https://www.google.com/maps/embed/v1/${exact ? "place" : "view"}?key=${encodeURIComponent(googleKey)}&${
        exact ? `q=${lat},${lng}` : `center=${lat},${lng}`
      }&zoom=${exact ? 15 : 13}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - span},${lat - span * 0.6},${lng + span},${lat + span * 0.6}&layer=mapnik${
        exact ? `&marker=${lat},${lng}` : ""
      }`;

  return (
    <figure>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-sand ring-1 ring-line sm:aspect-[16/8]">
        <iframe
          title={`Map showing the ${exact ? "location" : "general area"} of ${label}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0"
        />
      </div>
      <figcaption className="mt-2 flex items-center gap-1.5 text-xs text-muted">
        <MapPin className="size-3.5" aria-hidden="true" />
        {exact ? "Location is approximate." : "Exact address not published — map shows the general area."}{" "}
        {!googleKey ? (
          <>
            Map data ©{" "}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">
              OpenStreetMap
            </a>{" "}
            contributors.
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}
