import { BadgeCheck, ChartNoAxesCombined, Handshake, MessagesSquare } from "lucide-react";
import { realtor } from "@/config/realtor";
import { SectionHeading } from "@/components/ui/SectionHeading";

const VALUE_PROPS = [
  {
    icon: ChartNoAxesCombined,
    title: "Local market expertise",
    body: "Street-by-street pricing insight, so you know when a home is a great deal — or overpriced.",
  },
  {
    icon: Handshake,
    title: "Skilled negotiation",
    body: "A clear strategy for offers, conditions and multiple-offer situations that protects your interests.",
  },
  {
    icon: MessagesSquare,
    title: "Clear, fast communication",
    body: "Straight answers, same-day replies and regular updates from first showing to closing day.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted local network",
    body: "Introductions to reliable mortgage specialists, inspectors, lawyers and contractors.",
  },
];

export function WhyUs() {
  return (
    <section aria-labelledby="why-heading" className="container-page">
      <SectionHeading
        eyebrow="Why work with us"
        title={
          <span id="why-heading">
            Guidance you can count on, <span className="font-display font-normal italic">every step</span> of the way
          </span>
        }
        description={`${realtor.yearsExperience ? `${realtor.yearsExperience}+ years` : "Dedicated to"} helping buyers and sellers across ${realtor.areasServed.slice(0, 2).join(" and ")} make confident decisions.`}
      />
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE_PROPS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="card p-7 transition-transform duration-300 hover:-translate-y-1">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
