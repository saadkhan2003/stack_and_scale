BEGIN;

CREATE TABLE IF NOT EXISTS platform.payment_reconciliations (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  payment_attempt_id text NOT NULL REFERENCES platform.payment_attempts(id),
  invoice_id text REFERENCES platform.invoices(id),
  allocation_id text REFERENCES platform.payment_allocations(id),
  idempotency_key text NOT NULL,
  request_fingerprint text NOT NULL CHECK (request_fingerprint ~ '^[a-f0-9]{64}$'),
  status text NOT NULL CHECK (status IN ('unmatched','partially_matched','matched')),
  payment_amount_minor_units bigint NOT NULL CHECK (payment_amount_minor_units > 0),
  matched_amount_minor_units bigint NOT NULL DEFAULT 0 CHECK (matched_amount_minor_units >= 0),
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  mismatch_reason text,
  correction_of text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  UNIQUE (id, organization_id)
);

CREATE INDEX IF NOT EXISTS payment_reconciliations_payment_idx
  ON platform.payment_reconciliations (organization_id, payment_attempt_id, created_at DESC);

CREATE TABLE IF NOT EXISTS platform.payment_receipt_artifacts (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  receipt_id text NOT NULL REFERENCES platform.payment_receipts(id),
  payment_attempt_id text NOT NULL REFERENCES platform.payment_attempts(id),
  storage_key text NOT NULL,
  original_filename text NOT NULL,
  content_type text NOT NULL CHECK (content_type = 'application/pdf'),
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  checksum_sha256 text NOT NULL CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  access text NOT NULL DEFAULT 'private' CHECK (access = 'private'),
  signed_access_url text,
  signed_access_expires_at timestamptz,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, receipt_id),
  UNIQUE (id, organization_id)
);

CREATE TABLE IF NOT EXISTS platform.payment_receipt_access_audits (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  receipt_id text NOT NULL REFERENCES platform.payment_receipts(id),
  actor_id text NOT NULL,
  signed_access_url text NOT NULL,
  signed_access_expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION platform.prevent_payment_receipt_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'payment receipts are immutable';
END; $$;
DROP TRIGGER IF EXISTS payment_receipts_immutable ON platform.payment_receipts;
CREATE TRIGGER payment_receipts_immutable BEFORE UPDATE OR DELETE ON platform.payment_receipts FOR EACH ROW EXECUTE FUNCTION platform.prevent_payment_receipt_mutation();

CREATE OR REPLACE FUNCTION platform.prevent_payment_receipt_artifact_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'payment receipt artifacts are immutable';
END; $$;
DROP TRIGGER IF EXISTS payment_receipt_artifacts_immutable ON platform.payment_receipt_artifacts;
CREATE TRIGGER payment_receipt_artifacts_immutable BEFORE UPDATE OR DELETE ON platform.payment_receipt_artifacts FOR EACH ROW EXECUTE FUNCTION platform.prevent_payment_receipt_artifact_mutation();

CREATE OR REPLACE FUNCTION platform.prevent_payment_receipt_access_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'payment receipt access audits are append-only';
END; $$;
DROP TRIGGER IF EXISTS payment_receipt_access_audits_append_only ON platform.payment_receipt_access_audits;
CREATE TRIGGER payment_receipt_access_audits_append_only BEFORE UPDATE OR DELETE ON platform.payment_receipt_access_audits FOR EACH ROW EXECUTE FUNCTION platform.prevent_payment_receipt_access_audit_mutation();

CREATE OR REPLACE FUNCTION platform.prevent_payment_reconciliation_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'payment reconciliations are append-only';
END; $$;
DROP TRIGGER IF EXISTS payment_reconciliations_append_only ON platform.payment_reconciliations;
CREATE TRIGGER payment_reconciliations_append_only BEFORE UPDATE OR DELETE ON platform.payment_reconciliations FOR EACH ROW EXECUTE FUNCTION platform.prevent_payment_reconciliation_mutation();

COMMIT;
