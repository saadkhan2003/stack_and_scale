# Phase 13 Verification

## Verdict

Phase 13 is complete in code and local verification. It adds no mandatory paid
platform. Production rollout is gated by the separate Phase 12 launch review.

## Work-package evidence

| Package                  | Evidence                                                                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| 13.1 Staff shell         | Authenticated `/staff` workspace, role-aware navigation, access states, command search and sound preference.                  |
| 13.2 Dashboard           | Bounded new-lead, overdue-task, upcoming-demo, unresolved-support and pending-approval queues.                                |
| 13.3-13.4 CRM operations | Tenant-scoped lead 360 timeline, sensitive-field treatment, assignment, due dates, overdue semantics and completion controls. |
| 13.5 Approvals           | Separation of duties, policy allow-list, expiry, reminders, escalation, audit trail and deduplication.                        |
| 13.6 Search              | PostgreSQL search over permitted leads, tasks and knowledge documents; authorization precedes results and snippets.           |
| 13.7 Notifications       | Tenant-scoped inbox, read state, urgency/categories, deduplication, critical-notice protection and delivery state.            |
| 13.8 Knowledge           | Owner/review dates, lifecycle status, role/context-filtered suggestions and search mirroring.                                 |
| 13.9 Reports             | Funnel, response-time, workload, conversion and activity reports; bounded JSON reads and expiring asynchronous CSV exports.   |
| 13.10 Quality/security   | Permission, tenant-isolation, audit, integration, privacy-denial, worker and bounded list/search performance tests.           |
| 13.11 Release visibility | Staff-only sanitized release, migration, health and rollback-status view.                                                     |
| 13.12 Capacity           | Staff-only runtime capacity snapshot, projections, thresholds and degradation controls; capacity ledger updated.              |

## Verification run

- CI passed on the final Phase 13 source.
- API: 84 tests passed, 3 live-Keycloak tests skipped by opt-in design.
- Web: 31 tests passed.
- Workers: 10 tests passed.
- Database: 30 tests passed.
- Contracts, storage and UI package suites passed.
- Lint, typecheck, formatting and production builds passed.
- Bounded staff load test: 100 concurrent list/search cycles passed locally.

## Security boundaries

- Staff APIs require active organization membership and explicit permission.
- Lists, search, reports, exports, knowledge suggestions and notifications are
  organization-scoped.
- Sensitive lead fields are read-only in the staff UI.
- CSV exports contain aggregate data only and expire after 24 hours.
- Release/capacity views never return secrets or infrastructure credentials.

## Remaining external gate

The Phase 12 launch review remains separate. It still records the independent
backup/restore decision, retained-image rollback rehearsal, alert mailbox
receipt, privacy/legal approval and production acceptance evidence.
