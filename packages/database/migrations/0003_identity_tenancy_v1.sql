BEGIN;

CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE IF NOT EXISTS identity.users (
  id text PRIMARY KEY,
  external_subject text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  email_verified_at timestamptz,
  display_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
  mfa_enforced boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS identity.memberships (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES identity.users(id),
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  invited_by_user_id text REFERENCES identity.users(id),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  UNIQUE (user_id, organization_id)
);

CREATE TABLE IF NOT EXISTS identity.invitations (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'member')),
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by_user_id text NOT NULL REFERENCES identity.users(id),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

CREATE TABLE IF NOT EXISTS identity.sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES identity.users(id),
  organization_id text REFERENCES platform.organizations(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  mfa_satisfied boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_active_idx
  ON identity.sessions (user_id, status, expires_at);

CREATE TABLE IF NOT EXISTS identity.tenant_placements (
  organization_id text PRIMARY KEY REFERENCES platform.organizations(id),
  tier text NOT NULL CHECK (tier IN ('shared', 'dedicated_schema', 'dedicated_database')),
  connection_reference text NOT NULL,
  storage_scope text NOT NULL,
  migration_state text NOT NULL DEFAULT 'ready'
    CHECK (migration_state IN ('pending_migration', 'migrating', 'ready', 'disabled')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS memberships_organization_idx
  ON identity.memberships (organization_id, status);
CREATE INDEX IF NOT EXISTS invitations_pending_idx
  ON identity.invitations (organization_id, status, expires_at);

COMMIT;
