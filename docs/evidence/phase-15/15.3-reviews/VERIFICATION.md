# Phase 15.3 Reviews Verification

## Scope

Portal review requests and decisions are additive portal records. They do not
alter a canonical proposal, contract, deliverable or staff approval.

## Implemented safeguards

- `portal_reviews_enabled` defaults to `false` for every client organization.
- A request records its assigned user, exact target version and rendered SHA-256
  checksum. A decision must provide the same version and checksum.
- Foreign reviewers, expired/open-state violations, revoked requests and stale
  versions are denied before a decision can be inserted.
- Each review accepts one decision. Retrying the same actor/idempotency key is
  stable; a conflicting second decision is rejected.
- Portal project-grant authorization is rechecked before a decision is stored.

## Verification

- Portal review contract: 6 tests passed.
- Contracts suite: 71 tests passed.
- API typecheck, Prettier and `git diff --check` passed.

Database-backed route coverage is the next release verification step. It needs
the normal local Docker PostgreSQL or CI runner; the current Codex sandbox does
not permit connections to `127.0.0.1:5433`.

## Rollback

Set `portal_reviews_enabled` to `false` for the client organization. Existing
canonical staff approval workflows and all canonical records remain intact.
