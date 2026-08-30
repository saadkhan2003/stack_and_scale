BEGIN;

CREATE TABLE IF NOT EXISTS portal.membership_events (
  id text PRIMARY KEY,
  client_organization_id text NOT NULL REFERENCES portal.client_organizations(id),
  membership_id text NOT NULL REFERENCES portal.client_memberships(id),
  actor_id text NOT NULL REFERENCES identity.users(id),
  event_type text NOT NULL CHECK (event_type IN ('member_added', 'member_revoked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_membership_events_lookup_idx
  ON portal.membership_events (client_organization_id, membership_id, created_at DESC);

CREATE OR REPLACE FUNCTION portal.prevent_membership_event_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'portal membership events are append-only';
END;
$$;

DROP TRIGGER IF EXISTS portal_membership_events_append_only ON portal.membership_events;
CREATE TRIGGER portal_membership_events_append_only
  BEFORE UPDATE OR DELETE ON portal.membership_events
  FOR EACH ROW EXECUTE FUNCTION portal.prevent_membership_event_mutation();

COMMIT;
