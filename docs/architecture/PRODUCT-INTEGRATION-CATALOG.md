# Product integration-level catalog

This catalog applies the Phase 17 minimum-coupling rule to the current product
platform. It is intentionally small: no product runtime database is absorbed
by Stack & Scale.

| Capability | Integration level | Contract | Reason |
| --- | --- | --- | --- |
| Account and branch navigation | Authenticated deep link | product account URL | Product runtime does not need account data replication |
| Entitlements and offline operation | API integration | signed lease `1.0` | A runtime needs local, bounded authorization evidence |
| Installation health | Event/synchronization | heartbeat `1.0` | Minimal operational visibility; non-blocking |
| Lease/revocation notices | Event delivery | signed event `1.0` | At-least-once, unordered delivery is safe with ID deduplication |
| Product-local notes/preferences | Synchronization | mutation batch `1.0` | Client ownership with durable idempotency outcomes |
| Financial, inventory, permissions and contracts | No generic sync | server-authoritative conflict result | Domain-approved product contracts are required before replication |
| Installer release visibility | API link | Phase 16 release API | Existing account control plane remains authoritative |
| Provisioning | Managed/assisted | installation credential lifecycle | No unattended product-instance provisioning is enabled yet |

Each later product must add its own row and conflict policy before enabling
sync. It may not reinterpret this catalog as permission to replicate protected
business truth through the generic Phase 17 endpoint.
