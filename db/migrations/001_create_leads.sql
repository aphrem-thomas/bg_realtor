-- Leads captured from the website. See lib/leads/types.ts for the domain model.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source            text NOT NULL CHECK (source IN (
                      'PROPERTY_INQUIRY', 'VIEWING_REQUEST', 'ELIGIBILITY_CHECK',
                      'CONTACT_FORM', 'SELLER_INQUIRY', 'BUYER_INQUIRY')),
  status            text NOT NULL DEFAULT 'NEW' CHECK (status IN (
                      'NEW', 'CONTACTED', 'QUALIFIED', 'NURTURING', 'CLOSED', 'ARCHIVED')),
  name              text NOT NULL,
  email             text NOT NULL,
  phone             text,
  message           text,
  -- DDF ListingKey plus a snapshot of the listing at inquiry time. Listing data
  -- itself is never stored (see DDF data-retention guidance).
  property_id       text,
  property_address  text,
  property_url      text,
  -- Source-specific structured data (eligibility inputs/results, seller details, …)
  details           jsonb NOT NULL DEFAULT '{}'::jsonb,
  marketing_consent boolean NOT NULL DEFAULT false,
  attribution       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
CREATE INDEX IF NOT EXISTS leads_source_idx ON leads (source);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (lower(email));
CREATE INDEX IF NOT EXISTS leads_property_id_idx ON leads (property_id) WHERE property_id IS NOT NULL;
