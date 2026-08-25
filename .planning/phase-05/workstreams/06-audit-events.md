# WS06 — Identity audit event persistence

Goal: durable audit writer for login, recovery, MFA, invitation, role and
session events.

Owns: packages/database/src/audit-operations.ts,
packages/database/test/audit-operations.test.ts.

Requirements:

- recordIdentityAuditEvent(pool, input): writes into platform.audit_events
  with action namespaced identity.<event> (e.g. identity.session_revoked);
  metadata jsonb must reject values containing password/token/secret keys
  (case-insensitive sanitize-and-refuse, fail closed).
- Pure validation helpers exported separately for reuse.
- Tests >= 6 using fake Queryable pattern from placement-routing.test.ts:
  write success, redaction refusal, empty fields refusal, correlation id
  required, action namespace enforcement.
  Do not modify packages/database/src/index.ts (orchestrator wires exports).
