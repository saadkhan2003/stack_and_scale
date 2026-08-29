BEGIN;

ALTER TABLE platform.approval_requests
  ADD COLUMN IF NOT EXISTS reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS escalation_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminded_at timestamptz,
  ADD COLUMN IF NOT EXISTS escalated_at timestamptz;

ALTER TABLE platform.approval_audit_trail
  DROP CONSTRAINT IF EXISTS approval_audit_trail_event_check;
ALTER TABLE platform.approval_audit_trail
  ADD CONSTRAINT approval_audit_trail_event_check
  CHECK (event IN ('requested', 'approved', 'rejected', 'expired', 'reminded', 'escalated'));

CREATE INDEX IF NOT EXISTS approval_requests_lifecycle_idx
  ON platform.approval_requests (organization_id, decision, reminder_at, escalation_at);

CREATE TABLE IF NOT EXISTS platform.support_items (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'pending_customer', 'resolved', 'closed')),
  severity text NOT NULL DEFAULT 'normal'
    CHECK (severity IN ('low', 'normal', 'high', 'critical')),
  assignee_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS support_items_dashboard_idx
  ON platform.support_items (organization_id, status, updated_at DESC);

COMMIT;
