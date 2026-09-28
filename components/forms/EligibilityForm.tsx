"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { submitEligibility } from "@/app/actions/leads";
import { track } from "@/lib/analytics/client";
import { CREDIT_SCORE_RANGES, EMPLOYMENT_TYPES } from "@/lib/eligibility/types";
import type { EligibilityFormState } from "@/lib/forms/state";
import { cn } from "@/lib/utils/cn";
import { AttributionFields, CheckboxField, ChoiceField, FormAlert, Honeypot, SelectField, SubmitButton, TextField } from "./fields";
import { EligibilityResultView, type ResultContact } from "./EligibilityResult";

const STEP_ONE_FIELDS = ["annualIncome", "applicants", "employmentType", "downPayment", "monthlyDebts", "creditScore", "desiredPrice", "firstTimeBuyer", "ownsProperty"];

const initialState: EligibilityFormState = { status: "idle" };

/**
 * Two-step affordability form: (1) finances, (2) contact details. The server
 * validates everything, calculates the estimate, stores the lead and returns
 * the result, which replaces the form.
 */
export function EligibilityForm({ contact }: { contact: ResultContact }) {
  const [state, action] = useActionState(submitEligibility, initialState);
  const [step, setStep] = useState<1 | 2>(1);
  const stepOneRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // If the server flags a step-one field, take the visitor back there.
  const hasStepOneError = Object.keys(state.fieldErrors ?? {}).some((k) => STEP_ONE_FIELDS.includes(k));
  const [lastErrors, setLastErrors] = useState(state.fieldErrors);
  if (state.fieldErrors !== lastErrors) {
    setLastErrors(state.fieldErrors);
    if (hasStepOneError) setStep(1);
  }

  useEffect(() => {
    if (state.status === "success" && state.result) {
      track("eligibility_completed", { tier: state.result.tier, high_price: state.result.highPrice });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state]);

  // Move focus to the step heading when switching steps (not on first render).
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) headingRef.current?.focus();
    previousStep.current = step;
  }, [step]);

  if (state.status === "success" && state.result) {
    return <EligibilityResultView result={state.result} firstName={state.firstName} notice={state.message} contact={contact} />;
  }

  const goNext = () => {
    const container = stepOneRef.current;
    if (!container) return;
    const fields = Array.from(container.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select"));
    const invalid = fields.find((field) => !field.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    setStep(2);
  };

  return (
    <form
      action={action}
      className="relative"
      onFocusCapture={() => {
        if (!started.current) {
          started.current = true;
          track("eligibility_started", {});
        }
      }}
    >
      <Honeypot />
      <AttributionFields />

      <ol className="mb-8 grid grid-cols-2 gap-2" aria-label="Progress">
        {["Your finances", "Your estimate"].map((label, index) => (
          <li key={label} aria-current={step === index + 1 ? "step" : undefined}>
            <div className={cn("h-1.5 rounded-full transition-colors", step >= index + 1 ? "bg-accent" : "bg-line")} />
            <p className={cn("mt-2 text-xs font-semibold", step === index + 1 ? "text-ink" : "text-muted")}>
              Step {index + 1} · {label}
            </p>
          </li>
        ))}
      </ol>

      <div ref={stepOneRef} hidden={step !== 1} className="space-y-6">
        <h2 ref={step === 1 ? headingRef : undefined} tabIndex={-1} className="text-xl font-semibold tracking-tight outline-none">
          Tell us about your finances
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            name="annualIncome"
            label="Annual household income (before tax)"
            inputMode="numeric"
            placeholder="$120,000"
            hint="Combine income for all applicants."
            state={state}
          />
          <ChoiceField
            name="applicants"
            label="Number of applicants"
            state={state}
            defaultValue="1"
            options={[
              { value: "1", label: "Just me" },
              { value: "2", label: "Two of us" },
            ]}
          />
          <SelectField name="employmentType" label="Employment type" state={state} options={EMPLOYMENT_TYPES} placeholder="Choose one" />
          <SelectField name="creditScore" label="Credit score (estimate)" state={state} options={CREDIT_SCORE_RANGES} placeholder="Choose a range" />
          <TextField name="downPayment" label="Down payment available" inputMode="numeric" placeholder="$60,000" state={state} />
          <TextField
            name="monthlyDebts"
            label="Monthly debt payments"
            inputMode="numeric"
            placeholder="$450"
            hint="Car loans, student loans, credit card and line-of-credit minimums. Enter 0 if none."
            state={state}
          />
          <TextField
            name="desiredPrice"
            label="Target purchase price"
            inputMode="numeric"
            placeholder="$700,000"
            optional
            state={state}
          />
          <div className="hidden sm:block" />
          <ChoiceField
            name="firstTimeBuyer"
            label="First-time home buyer?"
            state={state}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          <ChoiceField
            name="ownsProperty"
            label="Do you currently own property?"
            state={state}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
        </div>
        {hasStepOneError ? <FormAlert state={state} /> : null}
        <button type="button" onClick={goNext} className="btn-primary min-h-12 w-full text-base sm:w-auto sm:px-8">
          Continue <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div hidden={step !== 2} className="space-y-6">
        <h2 ref={step === 2 ? headingRef : undefined} tabIndex={-1} className="text-xl font-semibold tracking-tight outline-none">
          Where should we send your estimate?
        </h2>
        <p className="-mt-3 text-sm text-muted">
          You&apos;ll see your results immediately. {contact.firstName} can also follow up with a free, personalized plan.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="name" label="Full name" autoComplete="name" state={state} className="sm:col-span-2" required={step === 2} />
          <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" state={state} required={step === 2} />
          <TextField name="phone" label="Phone" type="tel" autoComplete="tel" inputMode="tel" optional state={state} />
        </div>
        <CheckboxField name="marketingConsent" state={state} label="Email me listings in my price range and market updates. Unsubscribe anytime." />
        {!hasStepOneError ? <FormAlert state={state} /> : null}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={() => setStep(1)} className="btn-ghost">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </button>
          <SubmitButton pendingLabel="Calculating…" className="sm:w-auto sm:flex-1">
            See my estimate
          </SubmitButton>
        </div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Your information is sent securely and only shared with {contact.name}. This is an estimate, not a mortgage pre-approval, and
          checking does not affect your credit score.
        </p>
      </div>
    </form>
  );
}
