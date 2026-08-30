BEGIN;

CREATE TABLE IF NOT EXISTS platform.storage_quotas (
  organization_id text PRIMARY KEY REFERENCES platform.organizations(id),
  max_bytes bigint NOT NULL CHECK (max_bytes > 0),
  used_bytes bigint NOT NULL DEFAULT 0 CHECK (used_bytes >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS platform.private_files (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  owner_id text NOT NULL,
  original_filename text NOT NULL,
  classification text NOT NULL CHECK (classification IN ('internal','confidential','restricted')),
  retention_until timestamptz,
  legal_hold boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','quarantined','expired','deleted')),
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id)
);
CREATE TABLE IF NOT EXISTS platform.private_file_versions (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  file_id text NOT NULL REFERENCES platform.private_files(id),
  version integer NOT NULL CHECK (version > 0),
  storage_key text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  checksum_sha256 text NOT NULL CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  scan_status text NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending','clean','quarantined','failed')),
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, file_id, version), UNIQUE (id, organization_id)
);
CREATE TABLE IF NOT EXISTS platform.private_file_download_audits (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  file_id text NOT NULL,
  version_id text NOT NULL,
  actor_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS platform.provisioning_requests (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  customer_id text,
  source_type text NOT NULL,
  source_id text NOT NULL,
  idempotency_key text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','blocked','failed','completed','cancelled')),
  owner_id text,
  requested_by text NOT NULL,
  failure_reason text,
  retry_count integer NOT NULL DEFAULT 0,
  approval_request_id text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key), UNIQUE (id, organization_id)
);
CREATE TABLE IF NOT EXISTS platform.provisioning_steps (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  request_id text NOT NULL REFERENCES platform.provisioning_requests(id),
  step_key text NOT NULL, position integer NOT NULL CHECK (position >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','blocked','failed','completed')),
  owner_id text, privileged boolean NOT NULL DEFAULT false, high_cost boolean NOT NULL DEFAULT false,
  approval_request_id text, failure_reason text, retry_count integer NOT NULL DEFAULT 0,
  retry_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, request_id, step_key)
);
CREATE TABLE IF NOT EXISTS platform.communication_templates (
  id text PRIMARY KEY, organization_id text NOT NULL REFERENCES platform.organizations(id),
  event_type text NOT NULL, version integer NOT NULL CHECK (version > 0), subject text NOT NULL, body text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','retired')),
  created_by text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, event_type, version)
);
CREATE TABLE IF NOT EXISTS platform.commercial_communications (
  id text PRIMARY KEY, organization_id text NOT NULL REFERENCES platform.organizations(id),
  event_type text NOT NULL, resource_id text NOT NULL, recipient_id text NOT NULL, channel text NOT NULL DEFAULT 'email' CHECK (channel IN ('email')),
  template_id text NOT NULL, template_version integer NOT NULL, delivery_state text NOT NULL DEFAULT 'queued' CHECK (delivery_state IN ('queued','delivered','failed','not_requested')),
  resend_count integer NOT NULL DEFAULT 0, last_error text, created_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz,
  UNIQUE (organization_id, event_type, resource_id, recipient_id)
);
CREATE INDEX IF NOT EXISTS private_files_org_idx ON platform.private_files (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS provisioning_org_idx ON platform.provisioning_requests (organization_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS communications_org_idx ON platform.commercial_communications (organization_id, created_at DESC);

CREATE OR REPLACE FUNCTION platform.prevent_private_download_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'private download audits are append-only'; END; $$;
DROP TRIGGER IF EXISTS private_download_audits_append_only ON platform.private_file_download_audits;
CREATE TRIGGER private_download_audits_append_only BEFORE UPDATE OR DELETE ON platform.private_file_download_audits FOR EACH ROW EXECUTE FUNCTION platform.prevent_private_download_audit_mutation();
COMMIT;
