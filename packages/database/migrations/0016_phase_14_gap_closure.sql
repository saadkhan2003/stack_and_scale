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

ALTER TABLE platform.storage_quotas
  ADD COLUMN IF NOT EXISTS reserved_bytes bigint NOT NULL DEFAULT 0 CHECK (reserved_bytes >= 0);

ALTER TABLE platform.private_files
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by text,
  ADD COLUMN IF NOT EXISTS quarantine_reason text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE platform.private_file_versions
  ADD COLUMN IF NOT EXISTS scanned_at timestamptz,
  ADD COLUMN IF NOT EXISTS scan_reason text;

CREATE TABLE IF NOT EXISTS platform.private_file_lifecycle_audits (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  file_id text NOT NULL,
  actor_id text,
  action text NOT NULL CHECK (action IN ('uploaded','version_uploaded','restored','deleted','quarantined','expired','scan_updated')),
  from_status text,
  to_status text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS private_files_retention_idx
  ON platform.private_files (retention_until, legal_hold, status)
  WHERE retention_until IS NOT NULL;

CREATE OR REPLACE FUNCTION platform.reserve_private_storage(p_organization_id text, p_bytes bigint)
RETURNS boolean LANGUAGE plpgsql AS $$
BEGIN
  IF p_bytes <= 0 THEN RAISE EXCEPTION 'reservation bytes must be positive'; END IF;
  UPDATE platform.storage_quotas
     SET reserved_bytes = reserved_bytes + p_bytes, updated_at = now()
   WHERE organization_id = p_organization_id
     AND max_bytes >= used_bytes + reserved_bytes + p_bytes;
  RETURN FOUND;
END;
$$;

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
