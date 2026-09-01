# 17.4 SDK and simulator verification

`@stack-and-scale/product-integration-sdk` is transport-only and contains no
credential source. Its tests prove signature verification, lease persistence,
bounded grace, anti-rollback, event deduplication/reordering and transient
transport retry. The PostgreSQL API test supplies the reference online path:
credential → lease → signed event → acknowledge → offline-safe sync/reconnect.
