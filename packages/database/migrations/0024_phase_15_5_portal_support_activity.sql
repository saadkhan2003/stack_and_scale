BEGIN;

ALTER TABLE portal.client_organizations
  ADD COLUMN IF NOT EXISTS portal_support_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_activity_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_notifications_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS portal.activity_projections (
  id text PRIMARY KEY,
  client_organization_id text NOT NULL REFERENCES portal.client_organizations(id),
  event_type text NOT NULL CHECK (event_type IN ('deliverable_published', 'review_requested', 'proposal_published', 'contract_published', 'invoice_published', 'payment_confirmed', 'support_updated')),
  title text NOT NULL,
  occurred_at timestamptz NOT NULL,
  UNIQUE (client_organization_id, id)
);

CREATE INDEX IF NOT EXISTS portal_activity_projections_feed_idx
  ON portal.activity_projections (client_organization_id, occurred_at DESC, id);

COMMIT;
