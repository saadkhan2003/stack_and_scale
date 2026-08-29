BEGIN;

ALTER TABLE platform.knowledge_articles
  ADD COLUMN IF NOT EXISTS allowed_roles text[] NOT NULL DEFAULT ARRAY['owner', 'admin', 'manager', 'member'],
  ADD COLUMN IF NOT EXISTS context_tags text[] NOT NULL DEFAULT ARRAY[]::text[];

CREATE INDEX IF NOT EXISTS knowledge_articles_context_idx
  ON platform.knowledge_articles USING gin (context_tags);

CREATE TABLE IF NOT EXISTS platform.report_export_jobs (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  requested_by text NOT NULL REFERENCES identity.users(id),
  report_type text NOT NULL CHECK (report_type IN ('funnel', 'response-time', 'workload', 'conversion', 'activity')),
  from_at timestamptz NOT NULL,
  to_at timestamptz NOT NULL,
  timezone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  csv_body text,
  failure_reason text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  downloaded_at timestamptz
);

CREATE INDEX IF NOT EXISTS report_export_jobs_claim_idx
  ON platform.report_export_jobs (status, created_at);
CREATE INDEX IF NOT EXISTS report_export_jobs_tenant_idx
  ON platform.report_export_jobs (organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS report_export_jobs_expiry_idx
  ON platform.report_export_jobs (expires_at);

COMMIT;
