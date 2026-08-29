BEGIN;

CREATE TABLE IF NOT EXISTS platform.accounting_exports (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  contract_version integer NOT NULL DEFAULT 1 CHECK (contract_version > 0),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  correction_of text,
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  serialized jsonb NOT NULL,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, contract_version, period_start, period_end, correction_of),
  UNIQUE (id, organization_id),
  CHECK (period_end > period_start)
);

CREATE TABLE IF NOT EXISTS platform.accounting_export_records (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  export_id text NOT NULL REFERENCES platform.accounting_exports(id),
  import_key text NOT NULL,
  record_kind text NOT NULL CHECK (record_kind IN ('customer','invoice','credit','payment','fee','tax','reconciliation')),
  record_id text NOT NULL,
  correction_of text,
  occurred_at timestamptz NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (organization_id, import_key),
  UNIQUE (export_id, record_kind, record_id)
);

CREATE TABLE IF NOT EXISTS platform.accounting_imports (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  export_id text NOT NULL REFERENCES platform.accounting_exports(id),
  adapter_name text NOT NULL,
  import_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('accepted','rejected','duplicate')),
  external_batch_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, adapter_name, import_key)
);

CREATE TABLE IF NOT EXISTS platform.accounting_mappings (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  adapter_name text NOT NULL,
  record_kind text NOT NULL,
  source_id text NOT NULL,
  external_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, adapter_name, record_kind, source_id),
  UNIQUE (organization_id, adapter_name, record_kind, external_id)
);

CREATE TABLE IF NOT EXISTS platform.accounting_credits (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  customer_id text,
  invoice_id text,
  number text NOT NULL,
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  amount_minor_units bigint NOT NULL CHECK (amount_minor_units > 0),
  reason text NOT NULL,
  correction_of text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_by text NOT NULL,
  UNIQUE (organization_id, number)
);

CREATE TABLE IF NOT EXISTS platform.accounting_tax_entries (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  invoice_id text,
  code text NOT NULL,
  jurisdiction text,
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  amount_minor_units bigint NOT NULL CHECK (amount_minor_units >= 0),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS platform.accounting_fee_entries (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  payment_attempt_id text,
  provider text,
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  amount_minor_units bigint NOT NULL CHECK (amount_minor_units >= 0),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS platform.accounting_reconciliation_events (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  source_kind text NOT NULL,
  source_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('matched','unmatched','corrected','reversed')),
  correction_of text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS platform.support_tickets (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  customer_id text,
  subject text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  priority text NOT NULL CHECK (priority IN ('low','normal','high','urgent')),
  owner_id text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','waiting_on_client','waiting_on_staff','resolved','closed')),
  sla_target_seconds integer NOT NULL CHECK (sla_target_seconds > 0),
  first_response_at timestamptz,
  resolved_at timestamptz,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id)
);

CREATE TABLE IF NOT EXISTS platform.support_ticket_comments (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  ticket_id text NOT NULL REFERENCES platform.support_tickets(id),
  author_id text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('public','internal')),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.support_ticket_pauses (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  ticket_id text NOT NULL REFERENCES platform.support_tickets(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  reason text NOT NULL,
  created_by text NOT NULL,
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE IF NOT EXISTS platform.support_ticket_escalations (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  ticket_id text NOT NULL REFERENCES platform.support_tickets(id),
  from_priority text NOT NULL,
  to_priority text NOT NULL,
  reason text NOT NULL,
  escalated_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.support_ticket_attachments (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  ticket_id text NOT NULL REFERENCES platform.support_tickets(id),
  storage_object_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.support_ticket_events (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  ticket_id text NOT NULL REFERENCES platform.support_tickets(id),
  event_type text NOT NULL,
  actor_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_tickets_org_status_idx ON platform.support_tickets (organization_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS support_comments_ticket_idx ON platform.support_ticket_comments (organization_id, ticket_id, created_at);
CREATE INDEX IF NOT EXISTS accounting_exports_org_period_idx ON platform.accounting_exports (organization_id, period_start, period_end);

CREATE OR REPLACE FUNCTION platform.prevent_accounting_export_record_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'accounting export records are append-only'; END; $$;
DROP TRIGGER IF EXISTS accounting_export_records_append_only ON platform.accounting_export_records;
CREATE TRIGGER accounting_export_records_append_only BEFORE UPDATE OR DELETE ON platform.accounting_export_records FOR EACH ROW EXECUTE FUNCTION platform.prevent_accounting_export_record_mutation();

CREATE OR REPLACE FUNCTION platform.prevent_support_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'support events are append-only'; END; $$;
DROP TRIGGER IF EXISTS support_ticket_events_append_only ON platform.support_ticket_events;
CREATE TRIGGER support_ticket_events_append_only BEFORE UPDATE OR DELETE ON platform.support_ticket_events FOR EACH ROW EXECUTE FUNCTION platform.prevent_support_event_mutation();

COMMIT;
