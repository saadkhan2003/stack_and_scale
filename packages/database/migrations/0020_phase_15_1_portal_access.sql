BEGIN;

CREATE SCHEMA IF NOT EXISTS portal;

CREATE TABLE IF NOT EXISTS portal.client_organizations (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  customer_id text NOT NULL,
  portal_access_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, customer_id)
);

CREATE TABLE IF NOT EXISTS portal.client_memberships (
  id text PRIMARY KEY,
  client_organization_id text NOT NULL REFERENCES portal.client_organizations(id),
  user_id text NOT NULL REFERENCES identity.users(id),
  role text NOT NULL CHECK (role IN ('client_admin', 'client_member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS portal.project_grants (
  id text PRIMARY KEY,
  client_organization_id text NOT NULL REFERENCES portal.client_organizations(id),
  user_id text REFERENCES identity.users(id),
  project_id text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE (client_organization_id, user_id, project_id)
);

CREATE INDEX IF NOT EXISTS portal_client_memberships_user_idx
  ON portal.client_memberships (user_id, status);
CREATE INDEX IF NOT EXISTS portal_project_grants_lookup_idx
  ON portal.project_grants (client_organization_id, user_id, project_id, status);

COMMIT;
