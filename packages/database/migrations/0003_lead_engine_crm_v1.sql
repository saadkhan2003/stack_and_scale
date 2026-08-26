BEGIN;

ALTER TABLE platform.leads
  ADD COLUMN IF NOT EXISTS intake_type text NOT NULL DEFAULT 'contact' CHECK (intake_type IN ('demo', 'project', 'contact', 'whatsapp')),
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS message text,
  ADD COLUMN IF NOT EXISTS consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS attribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'qualified', 'proposal', 'won', 'lost')),
  ADD COLUMN IF NOT EXISTS owner_id text,
  ADD COLUMN IF NOT EXISTS probability integer NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS estimated_value numeric(12, 2),
  ADD COLUMN IF NOT EXISTS next_action_at timestamptz,
  ADD COLUMN IF NOT EXISTS lost_reason text;

CREATE INDEX IF NOT EXISTS leads_email_created_idx ON platform.leads (email, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_stage_owner_idx ON platform.leads (stage, owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS platform.lead_activities (
  id text PRIMARY KEY,
  lead_id text NOT NULL REFERENCES platform.leads(id) ON DELETE CASCADE,
  actor_id text,
  type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.lead_notes (
  id text PRIMARY KEY,
  lead_id text NOT NULL REFERENCES platform.leads(id) ON DELETE CASCADE,
  author_id text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.lead_tasks (
  id text PRIMARY KEY,
  lead_id text NOT NULL REFERENCES platform.leads(id) ON DELETE CASCADE,
  assignee_id text,
  title text NOT NULL,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.demo_bookings (
  id text PRIMARY KEY,
  lead_id text NOT NULL REFERENCES platform.leads(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  timezone text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'alternate_requested')),
  alternate_request text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS demo_bookings_active_slot_idx
  ON platform.demo_bookings (starts_at)
  WHERE status = 'confirmed';

COMMIT;
