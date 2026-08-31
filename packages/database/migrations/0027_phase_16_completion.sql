BEGIN;

SELECT pg_advisory_xact_lock(hashtext('phase_16_completion_schema'));

CREATE TABLE IF NOT EXISTS product.branch_memberships (
  branch_id text NOT NULL REFERENCES product.account_branches(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES identity.users(id),
  account_membership_id text NOT NULL REFERENCES product.account_memberships(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (branch_id, user_id)
);

CREATE TABLE IF NOT EXISTS product.plan_version_addons (
  plan_version_id text NOT NULL REFERENCES product.plan_versions(id),
  addon_id text NOT NULL REFERENCES product.addons(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (plan_version_id, addon_id)
);

CREATE TABLE IF NOT EXISTS product.subscription_addons (
  subscription_id text NOT NULL REFERENCES product.subscriptions(id) ON DELETE CASCADE,
  addon_id text NOT NULL REFERENCES product.addons(id),
  effective_from timestamptz NOT NULL,
  effective_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (effective_until IS NULL OR effective_until > effective_from),
  PRIMARY KEY (subscription_id, addon_id, effective_from)
);

ALTER TABLE product.billing_projections
  ADD COLUMN IF NOT EXISTS source_event_key text;
CREATE UNIQUE INDEX IF NOT EXISTS product_billing_projection_event_key_idx
  ON product.billing_projections (account_organization_id, source_event_key)
  WHERE source_event_key IS NOT NULL;

ALTER TABLE product.support_projections
  ADD COLUMN IF NOT EXISTS source_event_key text;
CREATE UNIQUE INDEX IF NOT EXISTS product_support_projection_event_key_idx
  ON product.support_projections (account_organization_id, source_event_key)
  WHERE source_event_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS product_branch_membership_lookup_idx
  ON product.branch_memberships (user_id, branch_id);
CREATE INDEX IF NOT EXISTS product_subscription_addons_lookup_idx
  ON product.subscription_addons (subscription_id, effective_from, effective_until);

COMMIT;
