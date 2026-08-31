# Phase 16.2 — subscription state machine

- `ProductAccountService.transitionSubscription` records an audited,
  idempotency-keyed subscription event for every accepted change.
- `product-account.integration.test.ts` exercises every documented legal edge,
  confirms retry replay, and confirms invalid transitions receive HTTP 409.
- Account disablement is separately enforced at the access boundary and was
  verified in production using the protected enable/disable rollback drill.
