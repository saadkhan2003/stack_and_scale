BEGIN;

CREATE TABLE IF NOT EXISTS platform.proposal_view_events (
  id text PRIMARY KEY,
  proposal_id text NOT NULL REFERENCES platform.proposals(id),
  version_id text NOT NULL REFERENCES platform.proposal_versions(id),
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  viewed_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

CREATE INDEX IF NOT EXISTS proposal_views_org_viewed_idx
  ON platform.proposal_view_events (organization_id, viewed_at DESC);

COMMIT;
