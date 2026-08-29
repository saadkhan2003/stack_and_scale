# Phase 12 Launch Trace — V1 Integration, Hardening and Launch

## Purpose and truthfulness rule

Phase 12 validates the already-built V1 as a real operational service. It does
not add a separate product. A local implementation or a passing unit test is
not production proof. A check becomes **passed** only when its stated
environment, operator, timestamp and evidence are recorded below or in a
linked dated record.

**Current verdict: launch review is blocked by external setup.** The immutable
production release and core edge smoke checks now pass, but no production launch
is approved yet. The local implementation and the external checks are
deliberately separated so that nothing is silently treated as complete.

## V1 requirement trace

| V1 capability                         | Local implementation/evidence                                      | Required production acceptance                                                                                                  | Owner                     | Current state                               |
| ------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------- |
| V1-01 Brand and design                | Phase 02/07 evidence; public site implementation                   | Review deployed desktop/mobile routes against approved assets and truthful proof                                                | Content owner             | External review pending                     |
| V1-02 Public routes/content           | CMS and public-route implementation; Phase 06–08 evidence          | Publish each required route family and verify rendered content through the real domain                                          | Content owner             | External review pending                     |
| V1-03 Conversion                      | Phase 09 lead/demo/WhatsApp implementation and Chromium tests      | Submit product demo and project inquiry; verify attribution, confirmation and staff handling                                    | Sales owner               | External journey pending                    |
| V1-04 CMS publishing                  | Phase 06 contract/browser evidence                                 | Draft → review → publish → preview/cache refresh → correct public metadata                                                      | CMS owner                 | External journey pending                    |
| V1-05 SEO/search                      | Phase 08 evidence                                                  | Verify canonical/robots/sitemap/schema/search, Search Console ownership and production analytics consent behavior               | Content/SEO owner         | External review pending                     |
| V1-06 Lead engine/basic CRM           | Phase 09 API, database, worker and browser evidence                | Lead → CRM record/opportunity/task → real email; retry a failed delivery without a duplicate lead                               | Sales owner               | External journey pending                    |
| V1-07 Identity/authorization          | Phase 05 evidence and Keycloak configuration                       | Verify live staff role access, MFA policy, recovery and unauthorized denial/audit behavior                                      | Security owner            | External journey pending                    |
| V1-08 Backend/data                    | Phase 03–04 contracts, migrations and tests                        | Rehearse production migration and validate `/ready`, outbox, privacy operations and database access boundaries                  | Technical owner           | External rehearsal pending                  |
| V1-09 Delivery/environments           | Phase 10 Compose/IaC/delivery evidence; run 33244836006            | Apply/destroy staging; deploy immutable image; rehearse failed deployment and rollback                                          | Technical owner           | Production deploy passed; rehearsal pending |
| V1-10 Security/recovery/observability | [Phase 11 evidence](../phase-11/VERIFICATION.md)                   | Prove alerts, independent status, encrypted off-server backup and isolated restore                                              | Security/operations owner | Launch blocker                              |
| V1-11 Privacy operations              | Privacy controls and notices implemented across phases 00/03/04/08 | Complete access/export, correction, restriction, erasure, propagation, legal-hold and retention tests against actual processors | Privacy owner             | Launch blocker                              |
| V1-12 Launch proof                    | This trace and Phase 10–11 operations artifacts                    | Pass all journeys, quality, security, cost and recovery gates in production                                                     | Launch owner              | Launch blocker                              |

## Required end-to-end journeys

Record one dated evidence entry for each row. Never use production personal
data for a destructive privacy or restore rehearsal without the owner's
approval; use controlled test records and an isolated restore environment.

| ID  | Journey and success condition                                                                                                                  | Evidence required                                                          | State                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------- |
| J01 | CMS draft → review → publish → public cache refresh → expected page title, canonical and metadata                                              | CMS screenshots/URLs, timestamps and published record ID                   | Pending external setup |
| J02 | Product visitor → demo request → exactly one CRM lead/opportunity/task → confirmation email                                                    | Browser/video, database/CRM IDs and received-email evidence                | Pending external setup |
| J03 | Service visitor → project inquiry → attribution stored → authorized staff can review it                                                        | Browser request, attribution and authorized staff screen evidence          | Pending external setup |
| J04 | WhatsApp handoff carries attribution and staff can match it to the lead                                                                        | Generated handoff URL, CRM attribution record and matching evidence        | Pending external setup |
| J05 | Intentional email/job failure retains the lead, raises alert, retries and recovers without duplication                                         | Controlled failure log, alert, retry record and final delivered email      | Pending external setup |
| J06 | Anonymous and unauthorized staff requests receive consistent denial and protected actions create appropriate audit evidence                    | Requests/responses, audit entry and role matrix evidence                   | Pending external setup |
| J07 | Verified privacy request completes export, correction/restriction and erasure/anonymization across CRM, CMS, analytics, search, logs and files | Request ID, exported package, processor evidence and propagation checklist | Pending external setup |
| J08 | Legal hold/retention exception is justified, communicated and later expires/enforces correctly                                                 | Hold record, response, expiry evidence and retention job output            | Pending external setup |

## Quality and operations gates

### Tests runnable locally

- [x] Phase 11 API and worker TypeScript compilation.
- [x] Phase 11 metrics unit/integration tests (3 passing tests).
- [x] Backup/deploy script syntax and observability configuration parsing.
- [x] Production and observability Compose configuration merge.
- [ ] Run the full API readiness suite with PostgreSQL available; the prior
      sandbox attempt was environment-blocked, not a passing readiness result.
- [ ] Re-run a clean-clone/bootstrap and CI verification for Phase 01.

### Tests requiring staging or production

- [ ] Headed Chromium checks on the HTTPS real domain: public pages, forms,
      CMS, staff CRM and authorization journeys.
- [ ] Mobile and cross-browser review (Chromium, Firefox and Safari/iOS or a
      documented equivalent device/browser service).
- [ ] Manual keyboard, screen-reader and contrast accessibility review; log
      critical issues as launch blockers.
- [ ] Safe load, rate-limit and abuse testing; collect actual CPU, memory,
      database, queue, disk and response-time headroom.
- [ ] Production Core Web Vitals/Lighthouse review after caching and real DNS
      are active.
- [ ] Dependency, container and application scan execution; triage critical or
      high findings before traffic is enabled.
- [ ] Editorial and legal approval of all public content, cookie/privacy
      notice, processors, retention periods and contact/escalation text.
- [ ] Verify Consent/analytics behavior only after the actual analytics
      processor, retention policy and production domain are configured.
- [ ] Apply and destroy an isolated staging environment; record no orphaned
      billable resources and run a drift check.
- [ ] Prove Cloudflare-to-origin restrictions, SSH restrictions and that
      PostgreSQL has no reachable public port.
- [ ] Deploy an immutable image, migrate, run business smoke tests and rehearse
      a failed deployment rollback while preserving submitted leads.
- [ ] Route alerts to named responders; trigger/acknowledge outage, 5xx,
      resource-pressure and backup-miss alerts.
- [ ] Publish and test the independent status page while the application host
      is intentionally unreachable.
- [ ] Run an encrypted, geographically separate backup; restore database,
      Keycloak/identity, CMS/media, deployment configuration, IaC state and
      monitoring configuration into isolation. Record measured RPO/RTO.
- [ ] Verify the projected monthly external cost, including server, IPv4,
      storage/backup and domain, remains at or below USD 50; configure budget
      alerting where the provider permits it.

## Launch decision checklist

## Latest production evidence

```text
Date/time (UTC): 2026-08-29T11:33:43Z
Environment and URL: OVH production; https://stackandscale.org
Operator: Stack & Scale technical owner
Release/image digest and database migration version: release 21269f4; API,
  web, CMS and workers are running from that immutable release
Observed result: Website, CMS, API, Keycloak, PostgreSQL and workers are
  healthy. Prometheus is ready with 8 rules and 3/3 scrape targets up. Grafana
  is running. Website and contact routes return 200 with no observed browser
  console/network errors. API readiness returns 200. Public PostgreSQL port
  5432 is blocked. An unverified privacy request returns 400 as required.
  Rollback refusal guard was verified without contacting production.
Decision: partial; monitoring detection and production smoke pass, but alert
  notification delivery, full rollback rehearsal, privacy lifecycle, backup
  restore and legal/content approval remain open.
```

The launch owner must record **pass**, **blocked**, or an explicitly approved
deferral for every item. Security, privacy, backup/restore, data integrity and
lead-capture gaps cannot be deferred for V1 launch.

- [ ] All J01–J08 journeys pass in production.
- [ ] All production/staging tests above have linked evidence.
- [ ] Monitoring, alert routing, independent status and rollback are active.
- [ ] Backup restore is successful and data reconciliation is signed off.
- [ ] Privacy and processor/retention evidence passes end to end.
- [ ] Content owner and sales responder confirm operational readiness.
- [ ] Cost ledger is current and within the USD 50/month authority limit.
- [ ] Content/schema-changing work is frozen for the release window.
- [ ] Immutable release, final backup, technical/business smoke tests and DNS
      traffic enablement are recorded.
- [ ] Launch decision, operator and timestamp are recorded here.

## Evidence-entry template

Copy this template under the relevant journey or gate when it is executed:

```text
Date/time (UTC):
Environment and URL:
Operator:
Release/image digest and database migration version:
Procedure and test data:
Observed result:
Evidence links (screenshots, logs, dashboard, command output):
Follow-up/incident reference (if any):
Decision: pass | blocked | approved deferral
```

## Launch decision

**Status: blocked pending the external gates listed above.** The current
production release `4f4d26f9f9d4282bfc436af06e36a756a5dddbaa` completed immutable
image builds, all four CRITICAL/HIGH Trivy gates, database migration, CMS
migration and promotion. Live website, CMS, API readiness and OIDC-start checks
also passed; edge header removal was subsequently reloaded and verified.

When the server, domain, Cloudflare zone, protected secrets and independent
backup target are configured, execute this document together with
[Phase 10 verification](../phase-10/VERIFICATION.md) and
[Phase 11 verification](../phase-11/VERIFICATION.md). Do not mark Phase 12
complete until all non-deferrable checklist items have evidence.
