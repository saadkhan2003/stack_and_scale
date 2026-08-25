# Quality Constitution and Release Gates

## Severity model

| Severity | Meaning | Release rule |
|---|---|---|
| Blocker | Data loss, unauthorized access, material privacy breach, payment/lead integrity loss, failed restore, critical accessibility barrier or unbounded spend | Must be fixed and re-verified before release |
| High | Core workflow failure, serious reliability/security issue, major performance regression or misleading public claim | Must be fixed unless a documented user-approved exception exists |
| Medium | Material but bounded defect with a safe workaround | May ship only with owner, due date and risk acceptance |
| Low | Cosmetic or minor usability issue | Track and prioritize normally |

## Required quality layers

| Layer | Applies when | Minimum evidence |
|---|---|---|
| Static checks | Every code change | Format, lint, typecheck, dependency/secret scan |
| Unit tests | Business rules and utilities | Deterministic passing tests |
| Integration tests | API, database, identity, jobs, adapters | Isolated service/database evidence |
| Contract tests | API/events/webhooks/SDKs | Version compatibility and failure behavior |
| Browser journeys | Public, staff and portal user flows | Passing critical-flow run output |
| Migration tests | Schema/data changes | Clean migration and recovery/roll-forward rehearsal |
| Accessibility | UI changes | Automated scan plus keyboard/manual review to WCAG 2.2 AA scope |
| Performance | Public/API or high-volume changes | Budget comparison and regression evidence |
| Security/tenant tests | Auth, data, files, payments, integrations | Denial, escalation, abuse and secret/redaction tests |
| Recovery/operations | Deployment/infrastructure/persistence changes | Restore, alert, rollback and cost/capacity evidence |

## V1 launch blockers

- unauthorized or cross-tenant data access;
- lost, silently duplicated or unrecoverable leads;
- failed production migration or restore rehearsal;
- missing privacy notice, consent behavior, privacy export/deletion propagation, legal-hold or retention evidence;
- unaudited privileged access or secrets/recovery-key weakness;
- major WCAG 2.2 AA blocker on a core journey;
- severe public performance regression;
- invented/unsupported proof or legal claim;
- projected recurring platform cost above USD 50;
- absent monitoring, independent status communication or critical alert response.

## Evidence location

Use `docs/evidence/phase-NN/<step-id>/`. Evidence contains commands run, test reports, screenshots where useful, version/config identifiers, cost/capacity calculations, reviewers and rollback result. Never place secrets or personal data in evidence.

