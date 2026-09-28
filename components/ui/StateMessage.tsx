import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Friendly empty / error / info panel. */
export function StateMessage({
  icon,
  title,
  description,
  actions,
  tone = "neutral",
  headingLevel = "h2",
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: "neutral" | "error";
  /** Use "h1" when the message is the whole page (404s, error pages). */
  headingLevel?: "h1" | "h2";
  className?: string;
}) {
  const Heading = headingLevel;
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn("card flex flex-col items-center px-6 py-14 text-center sm:px-12", className)}
    >
      {icon ? (
        <div
          className={cn(
            "mb-5 grid size-14 place-items-center rounded-full",
            tone === "error" ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent",
          )}
        >
          {icon}
        </div>
      ) : null}
      <Heading className="text-xl font-semibold tracking-tight text-balance">{title}</Heading>
      {description ? <div className="mt-2 max-w-md text-muted text-pretty">{description}</div> : null}
      {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
