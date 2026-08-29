BEGIN;

CREATE TABLE IF NOT EXISTS platform.proposals (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  lead_id text NOT NULL REFERENCES platform.leads(id),
  opportunity_id text REFERENCES platform.opportunities(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'issued', 'accepted', 'rejected', 'expired', 'cancelled')),
  current_version integer NOT NULL DEFAULT 1 CHECK (current_version > 0),
  public_token_hash text UNIQUE,
  accepted_version integer,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, organization_id)
);

CREATE TABLE IF NOT EXISTS platform.proposal_versions (
  id text PRIMARY KEY,
  proposal_id text NOT NULL REFERENCES platform.proposals(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  version integer NOT NULL CHECK (version > 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued')),
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  notes text NOT NULL DEFAULT '',
  totals jsonb NOT NULL DEFAULT '{}'::jsonb,
  issued_at timestamptz,
  issued_by text,
  created_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, version),
  UNIQUE (id, organization_id),
  CHECK (valid_until >= valid_from),
  CHECK ((status = 'issued' AND issued_at IS NOT NULL AND issued_by IS NOT NULL) OR status = 'draft')
);

CREATE TABLE IF NOT EXISTS platform.proposal_line_items (
  id text PRIMARY KEY,
  version_id text NOT NULL REFERENCES platform.proposal_versions(id) ON DELETE CASCADE,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  description text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_minor_units bigint NOT NULL CHECK (unit_price_minor_units >= 0),
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  optional boolean NOT NULL DEFAULT false,
  tax_configuration jsonb,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.proposal_acceptance_evidence (
  id text PRIMARY KEY,
  proposal_id text NOT NULL REFERENCES platform.proposals(id),
  version_id text NOT NULL REFERENCES platform.proposal_versions(id),
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  accepted_name text NOT NULL,
  accepted_email text,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  declaration text NOT NULL,
  UNIQUE (proposal_id, version_id)
);

CREATE INDEX IF NOT EXISTS proposals_org_updated_idx
  ON platform.proposals (organization_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS proposal_versions_org_idx
  ON platform.proposal_versions (organization_id, proposal_id, version DESC);
CREATE INDEX IF NOT EXISTS proposal_items_version_idx
  ON platform.proposal_line_items (organization_id, version_id, position);

CREATE OR REPLACE FUNCTION platform.prevent_issued_proposal_version_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'issued' THEN
    IF TG_OP = 'DELETE' OR NEW.proposal_id IS DISTINCT FROM OLD.proposal_id
       OR NEW.organization_id IS DISTINCT FROM OLD.organization_id
       OR NEW.version IS DISTINCT FROM OLD.version
       OR NEW.currency IS DISTINCT FROM OLD.currency
       OR NEW.valid_from IS DISTINCT FROM OLD.valid_from
       OR NEW.valid_until IS DISTINCT FROM OLD.valid_until
       OR NEW.notes IS DISTINCT FROM OLD.notes
       OR NEW.totals IS DISTINCT FROM OLD.totals
       OR NEW.issued_at IS DISTINCT FROM OLD.issued_at
       OR NEW.issued_by IS DISTINCT FROM OLD.issued_by
       OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'issued proposal versions are immutable';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proposal_versions_immutable ON platform.proposal_versions;
CREATE TRIGGER proposal_versions_immutable
  BEFORE UPDATE OR DELETE ON platform.proposal_versions
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_issued_proposal_version_mutation();

CREATE OR REPLACE FUNCTION platform.prevent_issued_proposal_item_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND EXISTS (SELECT 1 FROM platform.proposal_versions WHERE id = NEW.version_id AND status = 'issued') THEN
    RAISE EXCEPTION 'items belonging to issued proposal versions are immutable';
  END IF;
  IF TG_OP <> 'INSERT' AND EXISTS (SELECT 1 FROM platform.proposal_versions WHERE id = OLD.version_id AND status = 'issued') THEN
    RAISE EXCEPTION 'items belonging to issued proposal versions are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proposal_items_immutable ON platform.proposal_line_items;
CREATE TRIGGER proposal_items_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON platform.proposal_line_items
  FOR EACH ROW EXECUTE FUNCTION platform.prevent_issued_proposal_item_mutation();

COMMIT;
