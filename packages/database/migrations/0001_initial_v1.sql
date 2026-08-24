BEGIN;

CREATE SCHEMA IF NOT EXISTS platform;

CREATE TABLE IF NOT EXISTS platform.schema_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.organizations (
  id text PRIMARY KEY,
  name text NOT NULL,
  placement_id text NOT NULL DEFAULT 'shared-eu-1',
  created_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS platform.contacts (
  id text PRIMARY KEY,
  organization_id text REFERENCES platform.organizations(id),
  email text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

CREATE TABLE IF NOT EXISTS platform.leads (
  id text PRIMARY KEY,
  email text NOT NULL,
  name text,
  source text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.audit_events (
  id text PRIMARY KEY,
  organization_id text,
  actor_id text,
  action text NOT NULL,
  correlation_id text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS platform.outbox_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  organization_id text,
  correlation_id text NOT NULL,
  payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered', 'dead_letter')),
  available_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outbox_events_pending_idx ON platform.outbox_events (status, available_at);
CREATE INDEX IF NOT EXISTS audit_events_organization_idx ON platform.audit_events (organization_id, occurred_at DESC);

COMMIT;
