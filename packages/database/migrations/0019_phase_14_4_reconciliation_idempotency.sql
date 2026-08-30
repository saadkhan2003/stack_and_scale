BEGIN;

ALTER TABLE platform.payment_reconciliations
  ADD COLUMN IF NOT EXISTS request_fingerprint text;

DROP TRIGGER IF EXISTS payment_reconciliations_append_only ON platform.payment_reconciliations;
UPDATE platform.payment_reconciliations
SET request_fingerprint = md5(id)::text || md5(id || ':legacy')::text
WHERE request_fingerprint IS NULL;

ALTER TABLE platform.payment_reconciliations
  ALTER COLUMN request_fingerprint SET NOT NULL;

ALTER TABLE platform.payment_reconciliations
  ADD CONSTRAINT payment_reconciliations_fingerprint_format
  CHECK (request_fingerprint ~ '^[a-f0-9]{64}$');

CREATE TRIGGER payment_reconciliations_append_only BEFORE UPDATE OR DELETE ON platform.payment_reconciliations FOR EACH ROW EXECUTE FUNCTION platform.prevent_payment_reconciliation_mutation();

COMMIT;
