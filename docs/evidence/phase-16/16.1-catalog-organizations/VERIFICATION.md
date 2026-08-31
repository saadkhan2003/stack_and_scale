# Phase 16.1 — catalogue and product organizations

- Versioned products, editions, plans, plan versions, add-ons, product accounts,
  branches and membership tables are established by migrations `0026` and `0027`.
- The focused PostgreSQL integration suite proves explicit active membership,
  cross-account denial, idempotent branch creation and branch membership writes,
  expiring override validation, and last-owner protection.
- Staff catalogue and account operations are protected by `org:manage`; product
  account operations are scoped through active account membership.
