"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Grid2x2, Home, X } from "lucide-react";
import type { ListingPhoto } from "@/lib/ddf/types";
import { cn } from "@/lib/utils/cn";

/**
 * Listing photo gallery:
 *  - mobile: swipeable scroll-snap carousel
 *  - desktop: large lead photo + 4-up grid
 *  - both: full-screen lightbox with keyboard, swipe and thumbnail navigation
 */
export function PropertyGallery({ photos, title }: { photos: ListingPhoto[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const alt = (index: number) => photos[index]?.caption ?? `${title} — photo ${index + 1} of ${photos.length}`;

  if (photos.length === 0) {
    return (
      <div className="grid aspect-[16/9] place-items-center rounded-[var(--radius-panel)] bg-sand text-muted">
        <div className="text-center">
          <Home className="mx-auto size-10" aria-hidden="true" />
          <p className="mt-2 text-sm">Photos coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Property photos">
      {/* Mobile carousel */}
      <div className="relative -mx-4 sm:-mx-6 md:hidden">
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {photos.map((photo, index) => (
            <button
              key={photo.url}
              type="button"
              className="relative aspect-[4/3] w-full shrink-0 snap-center"
              onClick={() => setLightboxIndex(index)}
              aria-label={`Open photo ${index + 1} of ${photos.length} full screen`}
            >
              <Image
                src={photo.url}
                alt={alt(index)}
                fill
                // Hidden at md+ (desktop grid takes over), so request the smallest candidate there.
                sizes="(min-width: 768px) 1px, 100vw"
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                className="object-cover"
              />
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute right-4 bottom-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {slide + 1} / {photos.length}
        </span>
      </div>

      {/* Desktop grid */}
      <div className="relative hidden h-[min(62vh,560px)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[var(--radius-panel)] md:grid">
        {photos.slice(0, 5).map((photo, index) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className={cn(
              "group relative overflow-hidden bg-sand focus-visible:z-10",
              index === 0 ? "col-span-2 row-span-2" : "",
              photos.length === 1 && "col-span-4",
              photos.length === 2 && index === 1 && "col-span-2 row-span-2",
            )}
            aria-label={`Open photo ${index + 1} of ${photos.length} full screen`}
          >
            <Image
              src={photo.url}
              alt={alt(index)}
              fill
              sizes={index === 0 ? "50vw" : "25vw"}
              priority={index === 0}
              quality={index === 0 ? 85 : 75}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </button>
        ))}
        {photos.length > 5 ? (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="btn-light absolute right-4 bottom-4 shadow-lg"
          >
            <Grid2x2 className="size-4" aria-hidden="true" /> Show all {photos.length} photos
          </button>
        ) : null}
      </div>

      {lightboxIndex !== null ? (
        <Lightbox photos={photos} alt={alt} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      ) : null}
    </section>
  );
}

function Lightbox({
  photos,
  alt,
  startIndex,
  onClose,
}: {
  photos: ListingPhoto[];
  alt: (index: number) => string;
  startIndex: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(startIndex);
  const touchStart = useRef<number | null>(null);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    thumbsRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      aria-label="Photo viewer"
      className="m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-white backdrop:bg-ink"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <p className="text-sm font-medium text-white/80" aria-live="polite">
            {index + 1} / {photos.length}
          </p>
          <button type="button" onClick={() => dialogRef.current?.close()} className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label="Close photo viewer">
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div
          className="relative min-h-0 flex-1 touch-pan-y select-none"
          onPointerDown={(e) => (touchStart.current = e.clientX)}
          onPointerUp={(e) => {
            if (touchStart.current === null) return;
            const dx = e.clientX - touchStart.current;
            touchStart.current = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
        >
          <Image key={photos[index].url} src={photos[index].url} alt={alt(index)} fill sizes="100vw" quality={85} className="animate-fade-in object-contain" />
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20 sm:left-6"
                aria-label="Previous photo"
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20 sm:right-6"
                aria-label="Next photo"
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>

        {photos[index].caption ? <p className="px-6 pt-3 text-center text-sm text-white/80">{photos[index].caption}</p> : null}

        <div ref={thumbsRef} className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-4 sm:justify-center sm:px-6">
          {photos.map((photo, i) => (
            <button
              key={photo.url}
              type="button"
              data-index={i}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-opacity",
                i === index ? "opacity-100 ring-2 ring-white" : "opacity-50 hover:opacity-80",
              )}
            >
              <Image src={photo.url} alt="" fill sizes="80px" quality={60} className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
