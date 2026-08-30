BEGIN;

ALTER TABLE portal.client_organizations
  ADD COLUMN IF NOT EXISTS portal_commercial_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_files_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS portal.commercial_document_projections (
  id text PRIMARY KEY,
  client_organization_id text NOT NULL REFERENCES portal.client_organizations(id),
  project_id text REFERENCES portal.project_projections(id),
  document_type text NOT NULL CHECK (document_type IN ('proposal', 'contract', 'invoice', 'receipt')),
  display_name text NOT NULL,
  document_number text,
  status text NOT NULL,
  currency text,
  total_minor_units bigint,
  issued_at timestamptz,
  due_at timestamptz,
  payment_instructions text,
  receipt_available boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_organization_id, document_type, document_number)
);

CREATE TABLE IF NOT EXISTS portal.file_projections (
  id text PRIMARY KEY,
  client_organization_id text NOT NULL REFERENCES portal.client_organizations(id),
  project_id text NOT NULL REFERENCES portal.project_projections(id),
  display_name text NOT NULL,
  version_label text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  scan_status text NOT NULL CHECK (scan_status IN ('clean', 'pending', 'quarantined', 'failed')),
  published_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, display_name, version_label)
);

CREATE INDEX IF NOT EXISTS portal_commercial_documents_customer_idx
  ON portal.commercial_document_projections (client_organization_id, published_at DESC, id);
CREATE INDEX IF NOT EXISTS portal_file_projections_project_idx
  ON portal.file_projections (client_organization_id, project_id, published_at DESC, id);

COMMIT;
