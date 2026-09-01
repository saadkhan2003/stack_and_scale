BEGIN;

SELECT pg_advisory_xact_lock(hashtext('phase_17_product_integrations_schema'));

ALTER TABLE product.account_organizations
  ADD COLUMN IF NOT EXISTS integration_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS telemetry_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sync_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS product.installation_credentials (
  id text PRIMARY KEY,
  installation_id text NOT NULL REFERENCES product.installations(id),
  credential_hash text NOT NULL UNIQUE CHECK (credential_hash ~ '^[a-f0-9]{64}$'),
  status text NOT NULL CHECK (status IN ('active', 'replaced', 'revoked')),
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  replaced_at timestamptz,
  revoked_at timestamptz,
  CHECK (expires_at > issued_at)
);

CREATE TABLE IF NOT EXISTS product.integration_leases (
  id text PRIMARY KEY,
  installation_id text NOT NULL REFERENCES product.installations(id),
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  sequence bigint NOT NULL CHECK (sequence > 0),
  contract_version text NOT NULL,
  key_id text NOT NULL REFERENCES product.signing_key_metadata(key_id),
  payload jsonb NOT NULL,
  signature text NOT NULL,
  issued_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  grace_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > issued_at),
  CHECK (grace_until >= expires_at),
  UNIQUE (installation_id, sequence)
);

CREATE TABLE IF NOT EXISTS product.integration_events (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  product_id text NOT NULL REFERENCES product.catalog_products(id),
  installation_id text REFERENCES product.installations(id),
  event_type text NOT NULL,
  source text NOT NULL CHECK (source = 'platform'),
  subject_kind text NOT NULL CHECK (subject_kind IN ('installation', 'account')),
  subject_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  payload_version integer NOT NULL CHECK (payload_version > 0),
  payload jsonb NOT NULL,
  contract_version text NOT NULL,
  key_id text NOT NULL REFERENCES product.signing_key_metadata(key_id),
  signature text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product.integration_event_deliveries (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES product.integration_events(id),
  recipient_installation_id text NOT NULL REFERENCES product.installations(id),
  status text NOT NULL CHECK (status IN ('pending', 'delivered', 'dead_letter', 'paused')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_attempt_at timestamptz,
  delivered_at timestamptz,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, recipient_installation_id)
);

CREATE TABLE IF NOT EXISTS product.integration_sync_mutations (
  id text PRIMARY KEY,
  installation_id text NOT NULL REFERENCES product.installations(id),
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  mutation_id text NOT NULL,
  local_sequence bigint NOT NULL CHECK (local_sequence > 0),
  entity_kind text NOT NULL,
  base_version text,
  payload jsonb NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('accepted', 'duplicate', 'rejected', 'conflicted')),
  outcome_detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (installation_id, mutation_id),
  UNIQUE (installation_id, local_sequence)
);

CREATE TABLE IF NOT EXISTS product.integration_sync_cursors (
  installation_id text PRIMARY KEY REFERENCES product.installations(id),
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  cursor bigint NOT NULL DEFAULT 0 CHECK (cursor >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product.integration_conflicts (
  id text PRIMARY KEY,
  installation_id text NOT NULL REFERENCES product.installations(id),
  mutation_id text NOT NULL,
  entity_kind text NOT NULL,
  policy text NOT NULL CHECK (policy IN ('server_authoritative', 'append_only', 'base_version_match')),
  evidence jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS product.installation_heartbeats (
  id text PRIMARY KEY,
  installation_id text NOT NULL REFERENCES product.installations(id),
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  software_version text NOT NULL,
  lease_state text NOT NULL CHECK (lease_state IN ('valid', 'grace', 'expired', 'revoked')),
  sync_cursor bigint NOT NULL CHECK (sync_cursor >= 0),
  sync_status text NOT NULL CHECK (sync_status IN ('idle', 'pending', 'blocked', 'error')),
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_installation_credential_lookup_idx ON product.installation_credentials (installation_id, status, expires_at DESC);
CREATE INDEX IF NOT EXISTS product_integration_lease_lookup_idx ON product.integration_leases (installation_id, sequence DESC);
CREATE INDEX IF NOT EXISTS product_integration_event_lookup_idx ON product.integration_events (account_organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS product_integration_delivery_due_idx ON product.integration_event_deliveries (status, next_attempt_at);
CREATE INDEX IF NOT EXISTS product_integration_mutation_lookup_idx ON product.integration_sync_mutations (installation_id, local_sequence);
CREATE INDEX IF NOT EXISTS product_installation_heartbeat_lookup_idx ON product.installation_heartbeats (installation_id, received_at DESC);

COMMIT;
