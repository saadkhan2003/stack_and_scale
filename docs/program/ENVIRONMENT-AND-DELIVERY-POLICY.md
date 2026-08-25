# Environment and Delivery Policy

## Environment matrix

| Environment | Data allowed | Secrets | Lifetime | Promotion/use rule |
|---|---|---|---|---|
| Local development | Synthetic fixtures only | Local untracked development values | Developer controlled | Cannot access production systems/data |
| Automated test | Synthetic deterministic fixtures | Test-only values generated/injected by CI | Per run | Must be disposable and isolated |
| Preview | Sanitized fixtures or no persistent data | Preview-only scoped values | Maximum 72 hours, then delete | Created from reviewed change; never uses production data/secrets |
| Staging | Sanitized production-like fixtures only | Staging-only encrypted values | Ephemeral release window; delete after validation | Required for migrations/release rehearsal when risk warrants |
| Production | Approved live data only | Production values with Phase 10B custody controls | Persistent | Receives only promoted immutable release |

## Delivery path

1. Work occurs on a local feature branch with one bounded responsibility.
2. Required checks pass: formatting, lint/typecheck, relevant unit/integration/contract/browser/accessibility/security tests.
3. A reviewed change produces an immutable artifact and non-secret evidence.
4. The same artifact is promoted to preview or staging as required; migrations are rehearsed before production.
5. Production deployment requires an approved release record, health/business smoke tests, monitoring and a rollback-compatible schema/image.

## Approval and emergency rules

- Until a remote/branch-protection system exists, the company owner records review approval in the execution evidence before merge/promotion.
- After remote setup, protected branches require the defined checks and at least one approval before merge.
- Emergency changes use an incident record, the minimum safe fix, post-deploy verification and a retrospective review within one business day.
- Production data, credentials, database dumps and recovery keys are prohibited in local, test, preview and staging environments.
- Evidence is retained under `docs/evidence/` without secrets or personal data.

