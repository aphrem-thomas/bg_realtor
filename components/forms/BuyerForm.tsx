"use client";

import { useActionState, useEffect } from "react";
import { submitBuyerLead } from "@/app/actions/leads";
import { track } from "@/lib/analytics/client";
import { initialFormState } from "@/lib/forms/state";
import { BUYER_TIMELINES, PRE_APPROVAL_OPTIONS } from "@/lib/leads/schemas";
import { AttributionFields, CheckboxField, ConsentNote, FormAlert, Honeypot, SelectField, SubmitButton, TextAreaField, TextField } from "./fields";
import { SuccessPanel } from "./SuccessPanel";

export function BuyerForm({ realtorName }: { realtorName: string }) {
  const [state, action] = useActionState(submitBuyerLead, initialFormState);

  useEffect(() => {
    if (state.status === "success") track("buyer_form_submitted", {});
  }, [state]);

  if (state.status === "success") return <SuccessPanel title="You're on the calendar list" message={state.message} />;

  return (
    <form action={action} className="relative space-y-5">
      <Honeypot />
      <AttributionFields />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Full name" autoComplete="name" state={state} className="sm:col-span-2" />
        <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" state={state} />
        <TextField name="phone" label="Phone" type="tel" autoComplete="tel" inputMode="tel" optional state={state} />
        <SelectField name="timeline" label="When are you hoping to buy?" state={state} options={BUYER_TIMELINES} placeholder="Choose" />
        <SelectField name="preApproved" label="Mortgage pre-approval?" state={state} options={PRE_APPROVAL_OPTIONS} placeholder="—" optional />
        <TextField name="budget" label="Approximate budget" placeholder="e.g. $650,000" optional state={state} />
        <TextField name="areas" label="Areas you're considering" placeholder="e.g. Kanata, Westboro" optional state={state} />
      </div>
      <TextAreaField name="message" label="Must-haves or questions" optional state={state} rows={3} />
      <CheckboxField name="marketingConsent" state={state} label="Email me new listings that match. Unsubscribe anytime." />
      <FormAlert state={state} />
      <SubmitButton>Book my buyer consultation</SubmitButton>
      <ConsentNote realtorName={realtorName} />
    </form>
  );
}
