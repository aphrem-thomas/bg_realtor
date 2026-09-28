import type { EligibilityResult } from "@/lib/eligibility/types";

/** Result returned by every lead Server Action (consumed via useActionState). */
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Echo of submitted values so fields keep their content after a validation error. */
  values?: Record<string, string>;
};

export type EligibilityFormState = FormState & { result?: EligibilityResult; firstName?: string };

export const initialFormState: FormState = { status: "idle" };
