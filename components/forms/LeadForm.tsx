"use client";

import { useActionState, useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { submitPropertyInquiry } from "@/app/actions/leads";
import { track } from "@/lib/analytics/client";
import { initialFormState } from "@/lib/forms/state";
import { AttributionFields, CheckboxField, ConsentNote, FormAlert, Honeypot, SelectField, SubmitButton, TextAreaField, TextField } from "./fields";
import { SuccessPanel } from "./SuccessPanel";

/** "Interested in this property?" inquiry / viewing-request form. */
export function LeadForm({
  listingKey,
  address,
  realtorName,
  defaultViewing = false,
}: {
  listingKey: string;
  address: string;
  realtorName: string;
  defaultViewing?: boolean;
}) {
  const [state, action] = useActionState(submitPropertyInquiry, initialFormState);
  const [viewing, setViewing] = useState(defaultViewing);

  useEffect(() => {
    if (state.status === "success") track("property_inquiry", { listing_key: listingKey, viewing_request: viewing });
    // Only fire when a submission completes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.status === "success") {
    return <SuccessPanel title="Request sent" message={state.message} />;
  }

  return (
    <form action={action} className="relative space-y-4" noValidate={false}>
      <input type="hidden" name="listingKey" value={listingKey} />
      <Honeypot />
      <AttributionFields />

      <TextField name="name" label="Full name" autoComplete="name" state={state} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <TextField name="email" label="Email" type="email" autoComplete="email" inputMode="email" state={state} />
        <TextField name="phone" label="Phone" type="tel" autoComplete="tel" inputMode="tel" optional state={state} />
      </div>
      <TextAreaField
        name="message"
        label="Message"
        state={state}
        rows={3}
        defaultValue={`Hi ${realtorName.split(" ")[0]}, I'm interested in ${address}. Please send me more information.`}
      />

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3.5 text-sm font-medium transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
        <input
          type="checkbox"
          name="requestViewing"
          checked={viewing}
          onChange={(e) => setViewing(e.target.checked)}
          className="size-5 cursor-pointer accent-accent"
        />
        <CalendarCheck className="size-4 text-accent" aria-hidden="true" />
        I&apos;d like to schedule a viewing
      </label>
      {viewing ? (
        <TextField
          name="preferredViewingTime"
          label="Preferred days / times"
          placeholder="e.g. Weekday evenings or Saturday morning"
          optional
          state={state}
        />
      ) : null}

      <SelectField
        name="preferredContact"
        label="Preferred contact method"
        state={state}
        defaultValue="email"
        options={[
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone call" },
          { value: "text", label: "Text message" },
        ]}
      />

      <CheckboxField name="marketingConsent" state={state} label="Send me new listings and market updates. Unsubscribe anytime." />
      <FormAlert state={state} />
      <SubmitButton>{viewing ? "Request a viewing" : "Send inquiry"}</SubmitButton>
      <ConsentNote realtorName={realtorName} />
    </form>
  );
}
