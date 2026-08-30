BEGIN;

CREATE TABLE IF NOT EXISTS platform.canonical_document_artifacts (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  resource_type text NOT NULL CHECK (resource_type IN ('proposal', 'contract')),
  resource_id text NOT NULL,
  resource_version_id text NOT NULL,
  storage_key text NOT NULL,
  original_filename text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  checksum_sha256 text NOT NULL CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  retention_until timestamptz,
  legal_hold boolean NOT NULL DEFAULT false,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, resource_type, resource_version_id),
  UNIQUE (id, organization_id)
);

CREATE INDEX IF NOT EXISTS canonical_document_artifacts_retention_idx
  ON platform.canonical_document_artifacts (organization_id, retention_until);

COMMIT;
