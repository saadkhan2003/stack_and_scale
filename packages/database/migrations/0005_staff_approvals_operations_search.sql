BEGIN;

-- Additive fields retain existing CRM records while making new operations
-- queries explicitly tenant-scoped.
ALTER TABLE platform.leads
  ADD COLUMN IF NOT EXISTS organization_id text REFERENCES platform.organizations(id);

CREATE INDEX IF NOT EXISTS leads_organization_created_idx
  ON platform.leads (organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS platform.approval_requests (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  requester_id text NOT NULL,
  approver_id text,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  decision text NOT NULL DEFAULT 'pending'
    CHECK (decision IN ('pending', 'approved', 'rejected', 'expired')),
  reason text NOT NULL,
  expires_at timestamptz NOT NULL,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id)
);

CREATE INDEX IF NOT EXISTS approval_requests_org_decision_idx
  ON platform.approval_requests (organization_id, decision, expires_at, created_at DESC);

CREATE TABLE IF NOT EXISTS platform.approval_audit_trail (
  id text PRIMARY KEY,
  approval_id text NOT NULL REFERENCES platform.approval_requests(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  actor_id text NOT NULL,
  event text NOT NULL CHECK (event IN ('requested', 'approved', 'rejected', 'expired')),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS approval_audit_org_created_idx
  ON platform.approval_audit_trail (organization_id, created_at DESC);

-- This small, application-owned index gives internal procedures/documents a
-- stable source for PostgreSQL operations search without exposing CMS tables.
CREATE TABLE IF NOT EXISTS platform.operations_search_documents (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  resource_type text NOT NULL CHECK (resource_type IN ('content', 'document')),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS operations_search_documents_fts_idx
  ON platform.operations_search_documents
  USING gin (to_tsvector('simple', title || ' ' || body));
CREATE INDEX IF NOT EXISTS operations_search_documents_org_idx
  ON platform.operations_search_documents (organization_id, created_at DESC);

COMMIT;
