BEGIN;

ALTER TABLE platform.provisioning_requests
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE platform.provisioning_steps
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error_at timestamptz;

ALTER TABLE platform.commercial_communications
  ADD COLUMN IF NOT EXISTS variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS rendered_subject text,
  ADD COLUMN IF NOT EXISTS rendered_body text;

CREATE TABLE IF NOT EXISTS platform.communication_delivery_audits (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  communication_id text NOT NULL REFERENCES platform.commercial_communications(id),
  action text NOT NULL CHECK (action IN ('queued','resent','delivered','failed')),
  actor_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS communication_delivery_audits_org_idx
  ON platform.communication_delivery_audits (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS provisioning_steps_ready_idx
  ON platform.provisioning_steps (organization_id, status, retry_at, position);

COMMIT;
