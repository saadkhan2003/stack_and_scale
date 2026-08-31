# Phase 16.7 — support and notifications

- Support/status records are public-detail projections deduplicated by source
  event; the integration suite asserts a retry leaves one projection.
- Per-user product-account notification preferences initialize security,
  billing and product categories. Billing/product may change; security is not
  disableable. The integration suite covers both allowed and rejected updates.
