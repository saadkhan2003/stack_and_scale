# 17.1 Integration API verification

The versioned `/api/v1/product-integrations` API is backed by migration `0029`.
It authenticates only an active, non-expired installation credential bound to
an enabled product account, exposes a request ID, caps event pages at 100 and
uses generic authorization boundaries. The focused integration suite covers
unauthenticated denial and authenticated status/lease access.

The integration-level catalog is recorded in
`docs/architecture/PRODUCT-INTEGRATION-CATALOG.md`.
