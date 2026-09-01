# Phase 17 execution plan — product integrations and offline-first operation

**Status:** Approved for execution against frozen contract `1.0`.

## Requirement-to-evidence map

| Requirement | Step | Required evidence |
| --- | --- | --- |
| Integration levels and stable API | 17.1–17.2 | contract tests and generated typed client |
| Signed events and retries | 17.3 | signature, duplicate, retry/DLQ/replay tests |
| SDK and installation trust | 17.4–17.5 | simulator provision/rotate/revoke scenarios |
| Offline lease safety | 17.6 | outage, replay, rotation and compromise tests |
| Telemetry, sync and conflicts | 17.7–17.9 | privacy/rate/batch/conflict tests |
| Failure, compatibility, capacity | 17.10–17.11 | chaos report, compatibility matrix, capacity record |

## Serialized merge order

`17.0 contracts → 17.1 integration schema/API → 17.2 events → 17.3 trust and
leases → 17.4 SDK/simulator → 17.5 sync/conflicts → 17.6 telemetry → 17.7
chaos/compatibility → 17.8 capacity/rollout`. No product adapter may change a
frozen envelope, lease or conflict policy.

## Exit gate

A reference product simulator must provision, receive/verify a lease, work
inside its offline window, reconnect and reconcile. The tests must show that
duplicate/reordered operations do not corrupt state, old leases cannot restore
rights, revocation/key compromise follow policy, and the measured capacity gate
passes. Evidence is stored under `docs/evidence/phase-17/`.
