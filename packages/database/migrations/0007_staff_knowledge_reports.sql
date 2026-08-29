BEGIN;

CREATE TABLE IF NOT EXISTS platform.knowledge_articles (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('procedure', 'script', 'faq', 'onboarding')),
  body text NOT NULL,
  owner_id text NOT NULL REFERENCES identity.users(id),
  review_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS knowledge_articles_org_review_idx
  ON platform.knowledge_articles (organization_id, status, review_at, updated_at DESC);

COMMIT;
