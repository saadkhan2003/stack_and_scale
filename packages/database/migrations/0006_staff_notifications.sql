BEGIN;

CREATE TABLE IF NOT EXISTS platform.notifications (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  recipient_id text NOT NULL REFERENCES identity.users(id),
  category text NOT NULL CHECK (category IN ('security', 'crm', 'operations', 'billing', 'system')),
  urgency text NOT NULL CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  title text NOT NULL,
  body text NOT NULL,
  deep_link text NOT NULL CHECK (deep_link = '/staff' OR deep_link LIKE '/staff/%'),
  dedupe_key text NOT NULL,
  read_at timestamptz,
  delivery_state text NOT NULL DEFAULT 'not_requested'
    CHECK (delivery_state IN ('not_requested', 'queued', 'delivered', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, recipient_id, dedupe_key)
);

CREATE INDEX IF NOT EXISTS notifications_recipient_created_idx
  ON platform.notifications (organization_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx
  ON platform.notifications (organization_id, recipient_id, read_at, created_at DESC);

CREATE TABLE IF NOT EXISTS platform.notification_preferences (
  organization_id text NOT NULL REFERENCES platform.organizations(id),
  recipient_id text NOT NULL REFERENCES identity.users(id),
  category text NOT NULL CHECK (category IN ('security', 'crm', 'operations', 'billing', 'system')),
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, recipient_id, category),
  CHECK (category <> 'security' OR enabled = true)
);

COMMIT;
