BEGIN;

SELECT pg_advisory_xact_lock(hashtext('phase_16_product_control_plane_schema'));
CREATE SCHEMA IF NOT EXISTS product;

CREATE TABLE IF NOT EXISTS product.catalog_products (
  id text PRIMARY KEY,
  code text NOT NULL UNIQUE CHECK (code ~ '^[a-z0-9][a-z0-9_-]{1,62}$'),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product.editions (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES product.catalog_products(id),
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, code)
);

CREATE TABLE IF NOT EXISTS product.plans (
  id text PRIMARY KEY,
  edition_id text NOT NULL REFERENCES product.editions(id),
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (edition_id, code)
);

CREATE TABLE IF NOT EXISTS product.plan_versions (
  id text PRIMARY KEY,
  plan_id text NOT NULL REFERENCES product.plans(id),
  version integer NOT NULL CHECK (version > 0),
  effective_from timestamptz NOT NULL,
  effective_until timestamptz,
  price_currency text NOT NULL CHECK (price_currency ~ '^[A-Z]{3}$'),
  price_minor integer NOT NULL CHECK (price_minor >= 0),
  entitlements jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (effective_until IS NULL OR effective_until > effective_from),
  UNIQUE (plan_id, version)
);

CREATE TABLE IF NOT EXISTS product.addons (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES product.catalog_products(id),
  code text NOT NULL,
  name text NOT NULL,
  entitlements jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'retired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, code)
);

CREATE TABLE IF NOT EXISTS product.account_organizations (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES product.catalog_products(id),
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  account_enabled boolean NOT NULL DEFAULT false,
  billing_enabled boolean NOT NULL DEFAULT false,
  downloads_enabled boolean NOT NULL DEFAULT false,
  license_enforcement_enabled boolean NOT NULL DEFAULT false,
  canonical_organization_id text REFERENCES platform.organizations(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, display_name)
);

CREATE TABLE IF NOT EXISTS product.account_memberships (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  user_id text NOT NULL REFERENCES identity.users(id),
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'billing')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS product.account_branches (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_organization_id, name)
);

CREATE TABLE IF NOT EXISTS product.account_events (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  actor_id text NOT NULL REFERENCES identity.users(id),
  event_type text NOT NULL,
  idempotency_key text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_organization_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS product.subscriptions (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  plan_version_id text NOT NULL REFERENCES product.plan_versions(id),
  status text NOT NULL CHECK (status IN ('pending', 'trial', 'active', 'past_due', 'suspended', 'cancelled', 'expired', 'terminated')),
  effective_at timestamptz NOT NULL,
  ends_at timestamptz,
  override_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product.subscription_events (
  id text PRIMARY KEY,
  subscription_id text NOT NULL REFERENCES product.subscriptions(id),
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  actor_id text NOT NULL REFERENCES identity.users(id),
  from_status text,
  to_status text NOT NULL,
  reason text NOT NULL,
  effective_at timestamptz NOT NULL,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS product.entitlement_overrides (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  key text NOT NULL,
  value jsonb NOT NULL,
  effective_from timestamptz NOT NULL,
  effective_until timestamptz,
  actor_id text NOT NULL REFERENCES identity.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (effective_until IS NULL OR effective_until > effective_from)
);

CREATE TABLE IF NOT EXISTS product.entitlement_snapshots (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  subject_id text NOT NULL,
  sequence bigint NOT NULL,
  contract_version text NOT NULL,
  payload jsonb NOT NULL,
  key_id text NOT NULL,
  issued_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > issued_at),
  UNIQUE (account_organization_id, subject_id, sequence)
);

CREATE TABLE IF NOT EXISTS product.signing_key_metadata (
  id text PRIMARY KEY,
  key_id text NOT NULL UNIQUE,
  algorithm text NOT NULL,
  public_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'retiring', 'revoked')),
  not_before timestamptz NOT NULL,
  not_after timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (not_after > not_before)
);

CREATE TABLE IF NOT EXISTS product.licenses (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  product_id text NOT NULL REFERENCES product.catalog_products(id),
  status text NOT NULL DEFAULT 'granted' CHECK (status IN ('granted', 'active', 'revoked', 'replaced')),
  seat_limit integer NOT NULL DEFAULT 1 CHECK (seat_limit > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product.installations (
  id text PRIMARY KEY,
  license_id text NOT NULL REFERENCES product.licenses(id),
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  installation_key_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lease_expired', 'revoked', 'replaced')),
  last_sequence bigint NOT NULL DEFAULT 0,
  lease_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product.billing_projections (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  canonical_invoice_id text NOT NULL,
  status text NOT NULL,
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  amount_minor integer NOT NULL,
  due_at timestamptz,
  payment_instruction text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_organization_id, canonical_invoice_id)
);

CREATE TABLE IF NOT EXISTS product.releases (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES product.catalog_products(id),
  version text NOT NULL,
  platform text NOT NULL,
  checksum_sha256 text NOT NULL CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  signature text NOT NULL,
  key_id text NOT NULL REFERENCES product.signing_key_metadata(key_id),
  support_status text NOT NULL CHECK (support_status IN ('supported', 'deprecated', 'withdrawn')),
  storage_reference text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, version, platform)
);

CREATE TABLE IF NOT EXISTS product.download_audit_events (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  release_id text NOT NULL REFERENCES product.releases(id),
  actor_id text NOT NULL REFERENCES identity.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product.support_projections (
  id text PRIMARY KEY,
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  product_id text NOT NULL REFERENCES product.catalog_products(id),
  title text NOT NULL,
  status text NOT NULL,
  public_detail text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product.notification_preferences (
  account_organization_id text NOT NULL REFERENCES product.account_organizations(id),
  user_id text NOT NULL REFERENCES identity.users(id),
  category text NOT NULL CHECK (category IN ('security', 'billing', 'product')),
  enabled boolean NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_organization_id, user_id, category)
);

CREATE INDEX IF NOT EXISTS product_account_membership_lookup_idx ON product.account_memberships (user_id, account_organization_id, status);
CREATE INDEX IF NOT EXISTS product_subscription_account_idx ON product.subscriptions (account_organization_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS product_subscription_events_lookup_idx ON product.subscription_events (subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS product_entitlement_snapshot_lookup_idx ON product.entitlement_snapshots (account_organization_id, subject_id, sequence DESC);
CREATE INDEX IF NOT EXISTS product_installation_lookup_idx ON product.installations (account_organization_id, license_id, status);
CREATE INDEX IF NOT EXISTS product_billing_projection_lookup_idx ON product.billing_projections (account_organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS product_release_lookup_idx ON product.releases (product_id, support_status, created_at DESC);

COMMIT;
