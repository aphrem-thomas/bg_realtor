"use client";

import { useActionState, useEffect } from "react";
import { submitContact } from "@/app/actions/leads";
import { track } from "@/lib/analytics/client";
import { initialFormState } from "@/lib/forms/state";
import { CONTACT_REASONS } from "@/lib/leads/schemas";
import { AttributionFields, CheckboxField, ConsentNote, FormAlert, Honeypot, SelectField, SubmitButton, TextAreaField, TextField } from "./fields";
import { SuccessPanel } from "./SuccessPanel";

export function ContactForm({ realtorName, defaultReason }: { realtorName: string; defaultReason?: string }) {
  const [state, action] = useActionState(submitContact, initialFormState);

  useEffect(() => {
    if (state.status === "success") track("contact_form_submitted", {});
  }, [state]);

  if (state.status === "success") return <SuccessPanel title="Message sent" message={state.message} />;

  const reason = CONTACT_REASONS.some((r) => r.value === defaultReason) ? defaultReason : undefined;

  return (
    <form action={action} className="relative space-y-5">
      <Honeypot />
      <AttributionFields />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Full name" autoComplete="name" state={state} className="sm:col-span-2" />
        <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" state={state} />
        <TextField name="phone" label="Phone" type="tel" autoComplete="tel" inputMode="tel" optional state={state} />
        <SelectField
          name="reason"
          label="What can we help with?"
          state={state}
          options={CONTACT_REASONS}
          placeholder="Choose a reason"
          defaultValue={reason}
        />
        <SelectField
          name="preferredContact"
          label="Best way to reach you"
          state={state}
          defaultValue="email"
          options={[
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone call" },
            { value: "text", label: "Text message" },
          ]}
        />
      </div>
      <TextAreaField name="message" label="Message" state={state} placeholder="Tell us a little about what you're looking for…" rows={5} />
      <CheckboxField name="marketingConsent" state={state} label="Send me new listings and market updates. Unsubscribe anytime." />
      <FormAlert state={state} />
      <SubmitButton>Send message</SubmitButton>
      <ConsentNote realtorName={realtorName} />
    </form>
  );
}
