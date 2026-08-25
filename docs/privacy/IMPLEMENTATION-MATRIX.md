# Privacy Implementation Matrix

## Baseline

Privacy-by-design and GDPR-grade operational controls are required from day one (Q051). This is an implementation contract, not legal advice; legal review must validate notices, roles, lawful bases and retention periods for the actual operating jurisdictions.

| Control | V1 owner phases | Required implementation | Acceptance evidence |
|---|---|---|---|
| Privacy/cookie notice | 00, 07, 12 | Production notice accurately describes collected data, purposes, processors, retention and contact route | Content/legal review and deployed-page check |
| Consent/preference history | 04, 08, 09, 12 | Versioned records of notice, purpose, choice, time and relevant source; no form content sent to analytics | Integration tests and audit sample |
| Authenticated request intake | 04, 05, 12 | Identity verification, request type, scope, deadline, status and audit trail | Browser/API journey |
| Access and portable export | 04, 12 | Authorized export of relevant personal data in readable/portable form | Test export and authorization denial test |
| Correction | 04, 12 | Authorized correction workflow with original/change audit where required | Integration test |
| Restriction | 04, 12 | Processing restriction flags respected by relevant workflows | Integration and workflow test |
| Erasure/anonymization | 04, 08, 12 | Orchestrated deletion/anonymization with completion/exception/retry evidence | End-to-end propagation test |
| Legal hold/retention exception | 03, 04, 12 | Reason, authority, expiry and requester response; no silent deletion | State-machine and audit test |
| Retention enforcement | 04, 11, 12 | Configurable schedules, dry run, approved destructive run and evidence | Scheduler test and audit sample |
| Processor/vendor register | 00, 10, 12 | Approved provider, purpose, data categories, location, owner, export/deletion and contract status | Register review |
| Propagation | 03, 04, 08, 11, 12 | CRM, CMS, analytics, search, files, logs and backups follow explicit deletion/retention rules | Per-target completion evidence |
| Backups | 10, 11, 12 | Backup retention/expiry and restoration behavior documented; practical deletion model stated | Restore and retention evidence |

## Deletion semantics

Transactional systems delete or anonymize according to approved policy. Search indexes, caches and analytics receive propagation events. Logs redact/minimize rather than become a hidden profile store. Backups are encrypted, access-controlled and expire on documented retention; they are not rewritten ad hoc unless a documented legal/security event requires it. Legal hold overrides deletion only for its defined scope and duration.

## Request identity-verification policy

- **Account holders:** authenticate in the account/portal or staff-approved identity flow; do not rely on an email address alone for sensitive exports.
- **Unauthenticated leads:** use the original verified contact channel and a time-limited challenge; request only the minimum evidence needed to prevent disclosure to an impersonator.
- **Business representatives:** verify their relationship/authority using the organization’s existing authorized contact route or documented mandate; limit the response to the represented data scope.
- **Abuse or uncertainty:** pause fulfillment, record the reason, escalate to the privacy owner and provide a non-sensitive response path. Do not disclose whether sensitive records exist.
- **Timelines:** Phase 04 configures the applicable legal/business deadline and reminders; Phase 12 tests normal, denied, representative and expired-challenge cases.
- **Evidence minimization:** store request/verification outcome, method, time, actor and expiry—not copies of identity documents unless a legally reviewed process specifically requires it.
