BEGIN;

ALTER TABLE platform.outbox_events
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS dead_lettered_at timestamptz,
  ADD COLUMN IF NOT EXISTS replay_authorized_by text,
  ADD COLUMN IF NOT EXISTS replay_authorized_at timestamptz,
  ADD COLUMN IF NOT EXISTS replay_reason text;

CREATE TABLE IF NOT EXISTS platform.privacy_requests (
  id text PRIMARY KEY,
  requester_kind text NOT NULL CHECK (requester_kind IN ('account_holder', 'lead', 'representative', 'delegate')),
  requester_contact_id text REFERENCES platform.contacts(id),
  organization_id text REFERENCES platform.organizations(id),
  request_type text NOT NULL CHECK (request_type IN ('access', 'export', 'correction', 'restriction', 'erasure')),
  status text NOT NULL CHECK (status IN ('received', 'identity_verified', 'scoped', 'approved', 'refused', 'executing', 'completed', 'exception_held')),
  identity_verified_at timestamptz NOT NULL,
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  due_at timestamptz NOT NULL DEFAULT now() + interval '30 days',
  decision_reason text,
  correlation_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.privacy_request_targets (
  request_id text NOT NULL REFERENCES platform.privacy_requests(id) ON DELETE CASCADE,
  target text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'retrying', 'exception_held')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (request_id, target)
);

CREATE TABLE IF NOT EXISTS platform.legal_holds (
  id text PRIMARY KEY,
  organization_id text REFERENCES platform.organizations(id),
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  authority text NOT NULL,
  reason text NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.consent_evidence (
  id text PRIMARY KEY,
  contact_id text REFERENCES platform.contacts(id),
  purpose text NOT NULL,
  notice_version text NOT NULL,
  choice boolean NOT NULL,
  source text NOT NULL,
  occurred_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS privacy_requests_status_due_idx
  ON platform.privacy_requests (status, due_at);

CREATE INDEX IF NOT EXISTS privacy_request_targets_status_idx
  ON platform.privacy_request_targets (status, updated_at);

COMMIT;
