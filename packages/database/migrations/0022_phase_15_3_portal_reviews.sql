BEGIN;

ALTER TABLE portal.client_organizations
  ADD COLUMN IF NOT EXISTS portal_reviews_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS portal.review_requests (
  id text PRIMARY KEY,
  client_organization_id text NOT NULL REFERENCES portal.client_organizations(id),
  project_id text NOT NULL REFERENCES portal.project_projections(id),
  target_type text NOT NULL CHECK (target_type IN ('proposal', 'deliverable')),
  target_id text NOT NULL,
  target_version text NOT NULL,
  rendered_checksum_sha256 text NOT NULL CHECK (rendered_checksum_sha256 ~ '^[a-f0-9]{64}$'),
  assigned_user_id text NOT NULL REFERENCES identity.users(id),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'rejected', 'expired', 'revoked')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_organization_id, target_type, target_id, target_version, assigned_user_id)
);

CREATE TABLE IF NOT EXISTS portal.review_decisions (
  id text PRIMARY KEY,
  review_request_id text NOT NULL UNIQUE REFERENCES portal.review_requests(id),
  actor_id text NOT NULL REFERENCES identity.users(id),
  idempotency_key text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('accepted', 'rejected')),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_request_id, actor_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS portal_review_requests_assignee_idx
  ON portal.review_requests (client_organization_id, assigned_user_id, status, expires_at);

COMMIT;
