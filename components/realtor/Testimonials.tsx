import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/config/realtor";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {testimonials.map((t) => (
        <li key={t.id} className="card flex flex-col p-7">
          <Quote className="size-8 text-accent/30" aria-hidden="true" />
          {t.rating ? (
            <p className="mt-4 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: t.rating }, (_, i) => (
                <Star key={i} className="size-4 fill-accent text-accent" aria-hidden="true" />
              ))}
            </p>
          ) : null}
          <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink text-pretty">“{t.quote}”</blockquote>
          <footer className="mt-6 border-t border-line pt-4">
            <p className="font-semibold">{t.author}</p>
            <p className="text-sm text-muted">{t.context}</p>
          </footer>
        </li>
      ))}
    </ul>
  );
}
