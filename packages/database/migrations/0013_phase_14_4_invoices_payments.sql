BEGIN;

CREATE TABLE IF NOT EXISTS platform.invoices (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  customer_id text,
  proposal_id text,
  number text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_approval','approved','issued','due','partially_paid','paid','overdue','void','refunded')),
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  subtotal_minor_units bigint NOT NULL CHECK (subtotal_minor_units >= 0),
  discount_minor_units bigint NOT NULL DEFAULT 0 CHECK (discount_minor_units >= 0),
  tax_minor_units bigint NOT NULL DEFAULT 0 CHECK (tax_minor_units >= 0),
  total_minor_units bigint NOT NULL CHECK (total_minor_units >= 0),
  due_at timestamptz,
  issued_at timestamptz,
  issued_by text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, number), UNIQUE (id, organization_id),
  CHECK ((status IN ('issued','due','partially_paid','paid','overdue','refunded') AND issued_at IS NOT NULL AND issued_by IS NOT NULL) OR status IN ('draft','pending_approval','approved','void'))
);

CREATE TABLE IF NOT EXISTS platform.invoice_line_items (
  id text PRIMARY KEY, invoice_id text NOT NULL REFERENCES platform.invoices(id), organization_id text NOT NULL REFERENCES platform.organizations(id),
  description text NOT NULL, quantity integer NOT NULL CHECK (quantity > 0), unit_price_minor_units bigint NOT NULL CHECK (unit_price_minor_units >= 0), currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'), tax_configuration jsonb, position integer NOT NULL DEFAULT 0 CHECK (position >= 0)
);

CREATE TABLE IF NOT EXISTS platform.payment_attempts (
  id text PRIMARY KEY, organization_id text NOT NULL REFERENCES platform.organizations(id), amount_minor_units bigint NOT NULL CHECK (amount_minor_units > 0), currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'), method text NOT NULL CHECK (method IN ('bank_transfer','easypaisa','jazzcash','raast','cash')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected','cancelled')), proof_reference text, payment_reference text, payer_name text, payer_contact text, received_at timestamptz, receiving_account_or_till text, provider text, provider_transaction_reference text, fee_minor_units bigint NOT NULL DEFAULT 0 CHECK (fee_minor_units >= 0), recorded_by text NOT NULL, verified_by text, verified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (id, organization_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS payment_attempts_proof_unique_idx ON platform.payment_attempts (organization_id, proof_reference) WHERE proof_reference IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS payment_attempts_reference_unique_idx ON platform.payment_attempts (organization_id, payment_reference) WHERE payment_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS platform.payment_events (
  id text PRIMARY KEY, organization_id text NOT NULL REFERENCES platform.organizations(id), payment_attempt_id text NOT NULL REFERENCES platform.payment_attempts(id), event_type text NOT NULL CHECK (event_type IN ('recorded','verified','rejected','allocated','reversed','corrected','refunded')), amount_minor_units bigint NOT NULL CHECK (amount_minor_units > 0), metadata jsonb NOT NULL DEFAULT '{}'::jsonb, actor_id text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS platform.payment_allocations (
  id text PRIMARY KEY, organization_id text NOT NULL REFERENCES platform.organizations(id), payment_attempt_id text NOT NULL REFERENCES platform.payment_attempts(id), invoice_id text NOT NULL REFERENCES platform.invoices(id), amount_minor_units bigint NOT NULL CHECK (amount_minor_units > 0), event_id text NOT NULL REFERENCES platform.payment_events(id), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (id, organization_id)
);
CREATE TABLE IF NOT EXISTS platform.payment_provider_callbacks (
  id text PRIMARY KEY, organization_id text, provider text NOT NULL, provider_event_id text NOT NULL, event_type text NOT NULL, signature_valid boolean NOT NULL, payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[a-f0-9]{64}$'), payload jsonb NOT NULL DEFAULT '{}'::jsonb, received_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz, UNIQUE (provider, provider_event_id)
);
CREATE TABLE IF NOT EXISTS platform.payment_receipts (
  id text PRIMARY KEY, organization_id text NOT NULL REFERENCES platform.organizations(id), payment_attempt_id text NOT NULL REFERENCES platform.payment_attempts(id), receipt_number text NOT NULL, issued_by text NOT NULL, issued_at timestamptz NOT NULL DEFAULT now(), UNIQUE (organization_id, receipt_number), UNIQUE (payment_attempt_id)
);

CREATE INDEX IF NOT EXISTS invoices_org_updated_idx ON platform.invoices (organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS payment_events_org_created_idx ON platform.payment_events (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_allocations_invoice_idx ON platform.payment_allocations (organization_id, invoice_id, created_at);

CREATE OR REPLACE FUNCTION platform.prevent_issued_invoice_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IN ('issued','due','partially_paid','paid','overdue','refunded') AND (TG_OP = 'DELETE' OR NEW.organization_id IS DISTINCT FROM OLD.organization_id OR NEW.number IS DISTINCT FROM OLD.number OR NEW.currency IS DISTINCT FROM OLD.currency OR NEW.subtotal_minor_units IS DISTINCT FROM OLD.subtotal_minor_units OR NEW.discount_minor_units IS DISTINCT FROM OLD.discount_minor_units OR NEW.tax_minor_units IS DISTINCT FROM OLD.tax_minor_units OR NEW.total_minor_units IS DISTINCT FROM OLD.total_minor_units OR NEW.issued_at IS DISTINCT FROM OLD.issued_at OR NEW.issued_by IS DISTINCT FROM OLD.issued_by) THEN RAISE EXCEPTION 'issued invoices are immutable'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS invoices_immutable ON platform.invoices;
CREATE TRIGGER invoices_immutable BEFORE UPDATE OR DELETE ON platform.invoices FOR EACH ROW EXECUTE FUNCTION platform.prevent_issued_invoice_mutation();

CREATE OR REPLACE FUNCTION platform.prevent_issued_invoice_line_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE invoice_id text;
BEGIN
  invoice_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.invoice_id ELSE NEW.invoice_id END;
  IF EXISTS (SELECT 1 FROM platform.invoices WHERE id = invoice_id AND status IN ('issued','due','partially_paid','paid','overdue','refunded')) THEN
    RAISE EXCEPTION 'line items belonging to issued invoices are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF; RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS invoice_lines_immutable ON platform.invoice_line_items;
CREATE TRIGGER invoice_lines_immutable BEFORE INSERT OR UPDATE OR DELETE ON platform.invoice_line_items FOR EACH ROW EXECUTE FUNCTION platform.prevent_issued_invoice_line_mutation();

CREATE OR REPLACE FUNCTION platform.prevent_payment_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'payment events are append-only'; END; $$;
DROP TRIGGER IF EXISTS payment_events_append_only ON platform.payment_events;
CREATE TRIGGER payment_events_append_only BEFORE UPDATE OR DELETE ON platform.payment_events FOR EACH ROW EXECUTE FUNCTION platform.prevent_payment_event_mutation();

COMMIT;
