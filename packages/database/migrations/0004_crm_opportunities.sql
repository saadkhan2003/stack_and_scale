BEGIN;

CREATE TABLE IF NOT EXISTS platform.crm_pipeline_templates (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  intake_type text NOT NULL CHECK (intake_type IN ('demo', 'project', 'contact', 'whatsapp')),
  stages jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO platform.crm_pipeline_templates (id, name, intake_type, stages)
VALUES
  ('pipeline-product-demo', 'Product demo', 'demo', '["new", "qualified", "proposal", "won", "lost"]'::jsonb),
  ('pipeline-custom-project', 'Custom project', 'project', '["new", "qualified", "proposal", "won", "lost"]'::jsonb),
  ('pipeline-general-contact', 'General contact', 'contact', '["new", "qualified", "proposal", "won", "lost"]'::jsonb),
  ('pipeline-whatsapp', 'WhatsApp enquiry', 'whatsapp', '["new", "qualified", "proposal", "won", "lost"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS platform.opportunities (
  id text PRIMARY KEY,
  lead_id text NOT NULL UNIQUE REFERENCES platform.leads(id) ON DELETE CASCADE,
  pipeline_template_id text NOT NULL REFERENCES platform.crm_pipeline_templates(id),
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'qualified', 'proposal', 'won', 'lost')),
  owner_id text,
  probability integer NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  estimated_value numeric(12, 2),
  next_action_at timestamptz,
  lost_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS opportunities_pipeline_stage_idx
  ON platform.opportunities (pipeline_template_id, stage, owner_id, created_at DESC);

INSERT INTO platform.opportunities (id, lead_id, pipeline_template_id, title, stage, owner_id, probability, estimated_value, next_action_at, lost_reason)
SELECT
  'opportunity-' || l.id,
  l.id,
  CASE l.intake_type
    WHEN 'demo' THEN 'pipeline-product-demo'
    WHEN 'project' THEN 'pipeline-custom-project'
    WHEN 'whatsapp' THEN 'pipeline-whatsapp'
    ELSE 'pipeline-general-contact'
  END,
  COALESCE(l.name, 'Lead') || ' opportunity',
  l.stage, l.owner_id, l.probability, l.estimated_value, l.next_action_at, l.lost_reason
FROM platform.leads l
ON CONFLICT (lead_id) DO NOTHING;

COMMIT;
