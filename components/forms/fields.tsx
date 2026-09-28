"use client";

import { useEffect, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { FormState } from "@/lib/forms/state";
import { cn } from "@/lib/utils/cn";

type BaseProps = {
  name: string;
  label: string;
  state: FormState;
  hint?: string;
  optional?: boolean;
  className?: string;
};

function describedBy(name: string, error?: string, hint?: string) {
  return [error ? `${name}-error` : null, hint ? `${name}-hint` : null].filter(Boolean).join(" ") || undefined;
}

function FieldShell({ name, label, hint, optional, error, className, children }: Omit<BaseProps, "state"> & { error?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={`field-${name}`} className="field-label">
        {label}
        {optional ? <span className="ml-1 font-normal text-muted">(optional)</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${name}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  name,
  label,
  state,
  hint,
  optional,
  className,
  defaultValue,
  ...input
}: BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className">) {
  const error = state.fieldErrors?.[name];
  return (
    <FieldShell name={name} label={label} hint={hint} optional={optional} error={error} className={className}>
      <input
        id={`field-${name}`}
        name={name}
        required={!optional}
        defaultValue={state.values?.[name] ?? defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className="field-input"
        {...input}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  state,
  hint,
  optional,
  className,
  defaultValue,
  ...input
}: BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "className">) {
  const error = state.fieldErrors?.[name];
  return (
    <FieldShell name={name} label={label} hint={hint} optional={optional} error={error} className={className}>
      <textarea
        id={`field-${name}`}
        name={name}
        required={!optional}
        rows={4}
        defaultValue={state.values?.[name] ?? defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className="field-input min-h-28 resize-y py-3"
        {...input}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  state,
  hint,
  optional,
  className,
  options,
  placeholder,
  defaultValue,
  ...select
}: BaseProps & {
  options: readonly { value: string; label: string }[] | readonly string[];
  placeholder?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "className">) {
  const error = state.fieldErrors?.[name];
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <FieldShell name={name} label={label} hint={hint} optional={optional} error={error} className={className}>
      <select
        id={`field-${name}`}
        name={name}
        required={!optional}
        defaultValue={state.values?.[name] ?? defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className="field-input"
        {...select}
      >
        {placeholder !== undefined ? (
          <option value="" disabled={!optional}>
            {placeholder}
          </option>
        ) : null}
        {normalized.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

/** Segmented radio group (e.g. Yes / No). */
export function ChoiceField({
  name,
  label,
  state,
  options,
  defaultValue,
  className,
}: BaseProps & { options: readonly { value: string; label: string }[]; defaultValue?: string }) {
  const error = state.fieldErrors?.[name];
  const current = state.values?.[name] ?? defaultValue;
  return (
    <fieldset className={className} aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="field-label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input type="radio" name={name} value={option.value} defaultChecked={current === option.value} required className="peer sr-only" />
            <span className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-medium transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-accent/20 hover:border-ink/30">
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function CheckboxField({ name, label, state, defaultChecked }: { name: string; label: ReactNode; state: FormState; defaultChecked?: boolean }) {
  const checked = state.values ? state.values[name] === "on" : defaultChecked;
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-line accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}

export function SubmitButton({ children, pendingLabel = "Sending…", className }: { children: ReactNode; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={cn("btn-primary min-h-12 w-full text-base", className)}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  const success = state.status === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={cn(
        "flex items-start gap-3 rounded-xl p-4 text-sm",
        success ? "bg-accent-soft text-accent-strong" : "bg-danger-soft text-danger",
      )}
    >
      {success ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
      <p>{state.message}</p>
    </div>
  );
}

/** Hidden anti-spam field (see lib/security/request.ts). */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/** Captures page URL, referrer and UTM parameters for lead attribution. */
export function AttributionFields() {
  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only values after mount
    setValues({
      pageUrl: window.location.href.split("#")[0],
      referrer: document.referrer,
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
    });
  }, []);
  return (
    <>
      {Object.entries(values).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value.slice(0, 500)} />
      ))}
    </>
  );
}

export function ConsentNote({ realtorName }: { realtorName: string }) {
  return (
    <p className="text-xs leading-relaxed text-muted">
      By submitting, you agree that {realtorName} may contact you about your inquiry. Your information is handled according to our{" "}
      <a href="/privacy" className="underline hover:text-ink">
        privacy policy
      </a>
      .
    </p>
  );
}
