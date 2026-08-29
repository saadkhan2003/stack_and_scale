BEGIN;

CREATE TABLE IF NOT EXISTS platform.contract_templates (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
  created_by text NOT NULL,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id),
  CHECK ((status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR status <> 'approved')
);

CREATE TABLE IF NOT EXISTS platform.contract_template_versions (
  id text PRIMARY KEY,
  template_id text NOT NULL REFERENCES platform.contract_templates(id),
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  version integer NOT NULL CHECK (version > 0),
  body text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_sha256 text NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  created_by text NOT NULL,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, version),
  UNIQUE (id, organization_id),
  CHECK ((status = 'approved' AND approved_by IS NOT NULL AND approved_at IS NOT NULL) OR status = 'draft')
);

CREATE TABLE IF NOT EXISTS platform.contracts (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  template_id text NOT NULL,
  template_version_id text NOT NULL,
  proposal_id text NOT NULL,
  proposal_version_id text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'sent', 'partially_signed', 'signed', 'failed', 'cancelled')),
  variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  rendered_sha256 text NOT NULL CHECK (rendered_sha256 ~ '^[a-f0-9]{64}$'),
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id),
  UNIQUE (template_version_id, proposal_version_id)
);

CREATE TABLE IF NOT EXISTS platform.contract_signers (
  id text PRIMARY KEY,
  contract_id text NOT NULL REFERENCES platform.contracts(id),
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'signer',
  identity_method text NOT NULL DEFAULT 'email' CHECK (identity_method IN ('email', 'provider_verified', 'staff_verified', 'other')),
  identity_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contract_id, email)
);

CREATE TABLE IF NOT EXISTS platform.contract_signing_attempts (
  id text PRIMARY KEY,
  contract_id text NOT NULL REFERENCES platform.contracts(id),
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  provider text NOT NULL,
  provider_envelope_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'retryable_failure', 'failed', 'completed', 'cancelled')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error text,
  next_retry_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.contract_provider_callbacks (
  id text PRIMARY KEY,
  organization_id text,
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  signature_valid boolean NOT NULL,
  payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[a-f0-9]{64}$'),
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE (provider, provider_event_id)
);

CREATE TABLE IF NOT EXISTS platform.contract_artifacts (
  id text PRIMARY KEY,
  contract_id text NOT NULL REFERENCES platform.contracts(id),
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  kind text NOT NULL CHECK (kind IN ('provider_signed', 'uploaded_signed_fallback')),
  storage_key text NOT NULL,
  original_filename text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  checksum_sha256 text NOT NULL CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  provider text,
  provider_artifact_id text,
  retention_until timestamptz,
  legal_hold boolean NOT NULL DEFAULT false,
  uploaded_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((kind = 'provider_signed' AND provider IS NOT NULL) OR kind = 'uploaded_signed_fallback')
);

CREATE INDEX IF NOT EXISTS contract_templates_org_idx ON platform.contract_templates (organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS contract_versions_org_idx ON platform.contract_template_versions (organization_id, template_id, version DESC);
CREATE INDEX IF NOT EXISTS contracts_org_idx ON platform.contracts (organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS contract_artifacts_retention_idx ON platform.contract_artifacts (organization_id, retention_until);

CREATE OR REPLACE FUNCTION platform.prevent_approved_contract_version_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'approved' AND (TG_OP = 'DELETE' OR NEW.template_id IS DISTINCT FROM OLD.template_id OR NEW.organization_id IS DISTINCT FROM OLD.organization_id OR NEW.version IS DISTINCT FROM OLD.version OR NEW.body IS DISTINCT FROM OLD.body OR NEW.variables IS DISTINCT FROM OLD.variables OR NEW.content_sha256 IS DISTINCT FROM OLD.content_sha256 OR NEW.status IS DISTINCT FROM OLD.status OR NEW.approved_by IS DISTINCT FROM OLD.approved_by OR NEW.approved_at IS DISTINCT FROM OLD.approved_at) THEN
    RAISE EXCEPTION 'approved contract template versions are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS contract_template_versions_immutable ON platform.contract_template_versions;
CREATE TRIGGER contract_template_versions_immutable BEFORE UPDATE OR DELETE ON platform.contract_template_versions FOR EACH ROW EXECUTE FUNCTION platform.prevent_approved_contract_version_mutation();

CREATE OR REPLACE FUNCTION platform.prevent_contract_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IN ('sent', 'partially_signed', 'signed') AND (TG_OP = 'DELETE' OR NEW.template_version_id IS DISTINCT FROM OLD.template_version_id OR NEW.proposal_version_id IS DISTINCT FROM OLD.proposal_version_id OR NEW.variables IS DISTINCT FROM OLD.variables OR NEW.rendered_sha256 IS DISTINCT FROM OLD.rendered_sha256) THEN
    RAISE EXCEPTION 'sent contract versions are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS contracts_immutable ON platform.contracts;
CREATE TRIGGER contracts_immutable BEFORE UPDATE OR DELETE ON platform.contracts FOR EACH ROW EXECUTE FUNCTION platform.prevent_contract_mutation();

COMMIT;
