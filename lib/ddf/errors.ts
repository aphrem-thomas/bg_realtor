/**
 * Typed DDF errors. Messages here are for server logs only — the UI maps
 * `kind` to friendly copy and never shows internal details.
 */
export type DdfErrorKind =
  | "config" // credentials missing / misconfigured
  | "auth" // token request rejected (invalid credentials, inactive feed)
  | "not_found"
  | "bad_request"
  | "timeout"
  | "unavailable"; // network errors, 5xx, rate limiting

export class DdfError extends Error {
  readonly kind: DdfErrorKind;
  readonly status?: number;

  constructor(kind: DdfErrorKind, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "DdfError";
    this.kind = kind;
    this.status = options?.status;
  }
}

export function isDdfError(error: unknown): error is DdfError {
  return error instanceof DdfError;
}

/** User-facing copy for each failure mode. */
export function friendlyDdfMessage(error: unknown): { title: string; description: string } {
  const kind = isDdfError(error) ? error.kind : "unavailable";
  switch (kind) {
    case "timeout":
      return {
        title: "Listings are taking longer than usual",
        description: "The listing service is responding slowly. Please try again in a moment.",
      };
    case "config":
    case "auth":
      return {
        title: "Listings are temporarily unavailable",
        description: "We're having trouble connecting to our listing feed. Please check back shortly or contact us directly.",
      };
    default:
      return {
        title: "We couldn't load listings right now",
        description: "The listing service may be temporarily unavailable. Please try again shortly.",
      };
  }
}
