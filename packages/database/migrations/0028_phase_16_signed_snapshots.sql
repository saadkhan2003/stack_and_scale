BEGIN;

SELECT pg_advisory_xact_lock(hashtext('phase_16_signed_snapshots_schema'));

ALTER TABLE product.entitlement_snapshots
  ADD COLUMN IF NOT EXISTS signature text;

COMMIT;
