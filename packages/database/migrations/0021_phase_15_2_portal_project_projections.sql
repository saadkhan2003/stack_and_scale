BEGIN;

ALTER TABLE portal.client_organizations
  ADD COLUMN IF NOT EXISTS portal_home_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS portal_projects_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS portal.project_projections (
  id text PRIMARY KEY,
  client_organization_id text NOT NULL REFERENCES portal.client_organizations(id),
  source_project_id text NOT NULL,
  title text NOT NULL,
  scope_summary text NOT NULL,
  status text NOT NULL CHECK (status IN ('planned', 'active', 'on_hold', 'completed')),
  next_action text,
  published_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_organization_id, source_project_id)
);

CREATE TABLE IF NOT EXISTS portal.project_milestone_projections (
  id text PRIMARY KEY,
  project_projection_id text NOT NULL REFERENCES portal.project_projections(id) ON DELETE CASCADE,
  label text NOT NULL,
  status text NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'blocked')),
  due_on date,
  published_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_projection_id, label)
);

CREATE INDEX IF NOT EXISTS portal_project_projections_customer_idx
  ON portal.project_projections (client_organization_id, published_at DESC, id);
CREATE INDEX IF NOT EXISTS portal_project_milestones_project_idx
  ON portal.project_milestone_projections (project_projection_id, published_at, id);

COMMIT;
