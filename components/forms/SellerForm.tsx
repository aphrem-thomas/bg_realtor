"use client";

import { useActionState, useEffect } from "react";
import { submitSellerLead } from "@/app/actions/leads";
import { track } from "@/lib/analytics/client";
import { initialFormState } from "@/lib/forms/state";
import { SELLER_PROPERTY_TYPES, SELLER_TIMELINES } from "@/lib/leads/schemas";
import { AttributionFields, CheckboxField, ConsentNote, FormAlert, Honeypot, SelectField, SubmitButton, TextAreaField, TextField } from "./fields";
import { SuccessPanel } from "./SuccessPanel";

const COUNTS = ["1", "2", "3", "4", "5", "6"].map((n) => ({ value: n, label: n === "6" ? "6+" : n }));

/** "What's your home worth?" seller lead form. No automated valuation — the realtor follows up personally. */
export function SellerForm({ realtorName }: { realtorName: string }) {
  const [state, action] = useActionState(submitSellerLead, initialFormState);

  useEffect(() => {
    if (state.status === "success") track("seller_form_submitted", {});
  }, [state]);

  if (state.status === "success") {
    return <SuccessPanel title="Request received" message={state.message} />;
  }

  return (
    <form action={action} className="relative space-y-5">
      <Honeypot />
      <AttributionFields />
      <TextField
        name="propertyAddress"
        label="Property address"
        autoComplete="street-address"
        placeholder="Street address, city"
        state={state}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        <SelectField name="propertyType" label="Property type" state={state} options={SELLER_PROPERTY_TYPES} placeholder="Choose" className="sm:col-span-3" />
        <SelectField name="bedrooms" label="Bedrooms" state={state} options={COUNTS} placeholder="—" optional />
        <SelectField name="bathrooms" label="Bathrooms" state={state} options={COUNTS} placeholder="—" optional />
        <SelectField name="timeline" label="Timeline" state={state} options={SELLER_TIMELINES} placeholder="—" optional />
      </div>
      <div className="grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
        <TextField name="name" label="Full name" autoComplete="name" state={state} className="sm:col-span-2" />
        <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" state={state} />
        <TextField name="phone" label="Phone" type="tel" autoComplete="tel" inputMode="tel" state={state} />
      </div>
      <TextAreaField
        name="message"
        label="Anything else we should know?"
        optional
        state={state}
        placeholder="Recent renovations, special features, questions about the process…"
        rows={3}
      />
      <CheckboxField name="marketingConsent" state={state} label="Send me local market reports. Unsubscribe anytime." />
      <FormAlert state={state} />
      <SubmitButton>Get my home evaluation</SubmitButton>
      <ConsentNote realtorName={realtorName} />
    </form>
  );
}
