# Phase 13 Execution Plan

## Outcome

Deliver a secure internal staff workspace that turns the existing CRM API into
an actionable operations surface without introducing a paid platform.

## Scope order

1. Freeze staff permissions, dashboard definitions and timeline contracts.
2. Build the authenticated staff shell and role-aware navigation.
3. Build operational queues from existing lead, task, booking and outbox data.
4. Extend the lead 360 view, notifications and reports after the base shell
   and authorization checks pass.

## Dependencies

- Existing Keycloak session authentication and CRM membership policy.
- Existing lead, opportunity, task, activity and outbox schemas.
- Phase 12 remains an open launch gate; this phase does not close it.

## Write ownership

- Step 13.1 owns staff route/layout files and staff UI tests.
- Step 13.2 owns dashboard read models and dashboard tests.
- Authorization and CRM schema files remain frozen until a separate contract
  change is approved.

## Capacity and cost

Use the existing OVH VPS and PostgreSQL. No mandatory paid service is added.
Keep dashboard queries bounded and recheck CPU, memory, disk and connections
before release.

## Release and rollback

Staff routes remain server-side authorization protected. If the dashboard fails,
disable the staff dashboard route and retain direct lead processing.

## Evidence

Store verification under `docs/evidence/phase-13/` and never include secrets,
tokens, passwords or personal lead data.
