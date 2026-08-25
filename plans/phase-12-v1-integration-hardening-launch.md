# Phase 12 — V1 Integration, Hardening and Launch

## Outcome

Prove the complete public website, CMS, lead engine and production platform as one operational system, then launch through a controlled readiness gate.

## Execution profile

- **Model tier:** strongest for release judgment; default for bounded fixes
- **Mode:** serial convergence gate
- **External-platform spend:** must remain at or below $50/month
- **Depends on:** Phases 07, 08, 09, 10 and 11
- **Unlocks:** Phase 13

## Work packages

### 12.1 Requirement trace

- Map every V1 requirement to implementation, tests and operating owner.
- Mark unmet items blocked, deferred through approval or launch-blocking.
- Reject “mostly complete” for security, privacy, backup and lead-capture requirements.

### 12.2 End-to-end journeys

1. CMS draft → review → publish → cache refresh → correct public metadata.
2. Product visitor → demo request → CRM record → staff task → confirmation.
3. Service visitor → project inquiry → attribution → secure staff access.
4. WhatsApp handoff → attribution record → staff lead matching.
5. Failed email/job → retained lead → retry/alert → recovery.
6. Unauthorized visitor/staff request → consistent denial and audit.
7. Verified privacy request → access/portable export → correction or restriction → erasure/anonymization → propagation evidence across CRM, CMS, analytics, search, logs and files.
8. Legal hold/required retention → justified exception → requester response → later expiry and enforcement.

### 12.3 Quality hardening

- Cross-browser and mobile testing.
- Manual accessibility review.
- Load and abuse testing within safe limits.
- Performance and Core Web Vitals review.
- Dependency, container and application security scans.
- Content and legal-page review.
- Validate processor/vendor register, consent/preference history, retention scheduler and production privacy/cookie notices against actual deployed behavior.

### 12.4 Operational rehearsal

- Deployment and rollback rehearsal.
- Database migration rehearsal.
- Backup restore evidence review.
- Incident simulation.
- Contact escalation and status communication.
- Budget alert verification.

### 12.5 Launch sequence

- Freeze content/schema-changing work.
- Final backup and infrastructure plan.
- Deploy immutable release.
- Run technical and business smoke tests.
- Enable DNS/traffic.
- Monitor errors, conversion and resource saturation.
- Maintain rollback window.

### 12.6 Post-launch stabilization

- Daily review during the initial period.
- Fix launch-blocking defects only through normal release controls.
- Capture real performance, lead and operations data.
- Do not begin portal or AI work during unresolved stabilization.

## Launch blockers

- cross-tenant or unauthorized access;
- lost or duplicated leads;
- failed restore test;
- missing privacy/consent behavior;
- failed privacy export, deletion propagation, retention or legal-hold behavior;
- critical accessibility blocker;
- severe performance regression;
- unbounded platform spending;
- unverified production migration;
- fabricated content or unapproved customer proof.

## Exit criteria

- All V1 critical journeys pass in production.
- Monitoring and alerts are active.
- Rollback remains possible.
- Monthly projected external-platform cost is at or below $50.
- Content owners and sales responders are operationally ready.
- Stabilization defects are within accepted severity thresholds.
- Phase 13 begins only after a recorded launch review.
- Privacy-request journeys and processor/retention evidence pass end to end.

## Rollback and recovery

Revert DNS/traffic or application image while preserving submitted leads and database compatibility. If data integrity is uncertain, stop writes, communicate status and execute the recovery runbook.

## Cold-start handoff

Read all V1 phase evidence, `docs/program/REQUIREMENTS.md`, the threat model and budget ledger. This phase validates outcomes; it does not add major features.
