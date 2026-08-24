# Privacy Request and Deletion Contract

## Request intake and identity verification

The platform supports access, export, correction, restriction, objection/consent withdrawal and deletion requests. A request receives an ID, scope, legal basis/status, due date and audit trail. The requester is verified using the account session or an appropriate out-of-band verification process; staff may not fulfill a request merely because they know an email address.

Only the data subject, an authorized organization representative, or a verified legal delegate may request action. Staff authorization is separate from identity verification. Every state change is audit logged without copying restricted data into the request record.

## Lifecycle

```text
received → identity_verified → scoped → approved or refused
         → executing → completed or exception_held
```

Refusal, partial fulfillment and delay require a recorded reason, owner and next review date. The requester receives a safe status explanation; internal details and third-party information are not exposed.

## Deletion propagation

Deletion is a tracked workflow, not a one-table operation. The owning domain determines erasure, anonymization or retention state and propagates the result to:

1. transactional records and read projections;
2. CMS records and public search indexes where applicable;
3. analytics identities/events subject to consent and capability;
4. files/object metadata and signed-access grants;
5. logs/traces through redaction or expiry rather than retroactive unsafe mutation;
6. integration/provider records through documented processor workflows;
7. backups, where data expires through the backup retention cycle and cannot be reintroduced by restore without reapplying the deletion ledger.

The deletion ledger retains a minimal non-sensitive proof needed to prevent accidental re-creation and to demonstrate handling. A restore procedure must replay completed deletion/anonymization state after data recovery.

## Holds and required retention

An active scoped hold pauses only the affected destructive steps. The request shows `exception_held`, the hold authority/reason and review expiry are recorded, and unrelated data proceeds normally. Once the hold ends, the workflow resumes from a reauthorized scope check.

## Verification

Tests must prove unauthorized request access is denied, identity mismatch is rejected, each downstream target receives the propagation command, a hold blocks only scoped deletion, and restore reconciliation preserves completed erasures.
