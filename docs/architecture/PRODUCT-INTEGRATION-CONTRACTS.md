# Product integration and offline-first contracts

**Status:** Frozen technical baseline — version `1.0` (2026-09-01).

Phase 17 adds a product-integration boundary to the Phase 16 control plane.
Products retain their own operational databases. The platform owns commercial
state, installation trust, signed entitlements, integration delivery records,
and the minimal telemetry needed to operate the connection.

## Compatibility and identifiers

- Product APIs are rooted at `/api/v1/product-integrations`; compatible fields
  may be added, but a changed meaning or removed field requires `/v2` and a
  documented overlap period of two supported SDK minor versions.
- Every response contains `requestId`; list responses use opaque `cursor` and
  bounded `limit` (default 50, maximum 100). Errors use stable codes, never
  server stack traces.
- Installations, mutations, events and synchronization records use immutable
  client-safe IDs. Cross-account callers receive the same authorization
  boundary regardless of identifier existence.

## Installation trust

- An installation is provisioned through a one-time bootstrap credential,
  exchanged for a rotating installation credential stored only as a hash by
  the platform. Credentials are product- and installation-bound, and are never
  shared between binaries.
- `active`, `replaced` and `revoked` installation states gate every operation.
  Rotation has a short overlap; replacement/revocation invalidates the prior
  credential. Clock-skew tolerance is five minutes for signed artifacts.
- Sensitive staff recovery and emergency lease extension require MFA-backed
  authorization and an audit event. A commercial suspension and a security
  revocation are distinct decisions.

## Entitlement lease

An entitlement lease is an Ed25519-signed canonical JSON payload:

```json
{"contractVersion":"1.0","keyId":"...","installationId":"...","accountOrganizationId":"...","sequence":1,"issuedAt":"...","expiresAt":"...","graceUntil":"...","entitlements":{}}
```

The installation persists the largest accepted sequence for its own ID and
rejects a lease with a lower or equal sequence, even if it remains signed.
It may operate until `graceUntil` after an ordinary control-plane outage, but
must surface degraded state. Security revocation ends the lease immediately;
commercial suspension follows the published grace policy. Verification keys
are versioned public metadata; a retiring key overlaps a replacement key.

## Event delivery

Events are immutable and signed with a platform Ed25519 key. The signed bytes
are UTF-8 canonical JSON with lexicographically sorted object keys and no
insignificant whitespace. The envelope is:

```json
{"contractVersion":"1.0","eventId":"...","type":"...","source":"platform","subject":{"kind":"installation","id":"..."},"occurredAt":"...","payloadVersion":1,"payload":{},"keyId":"...","signature":"..."}
```

Consumers verify the signature and deduplicate by `eventId`; delivery is
at-least-once and unordered. The server tracks attempts, exponentially backs
off bounded retries, exposes a dead-letter state, and permits audited replay.

## Offline synchronization and conflicts

The reference product uses a mutation log rather than replicated financial or
permission truth. A mutation has a stable client-generated ID, installation
ID, local sequence, entity kind, payload, and base server version. Batches are
bounded (100 mutations / 1 MiB), idempotent by mutation ID and resumable with
an opaque server cursor.

| Entity class | Policy |
| --- | --- |
| Financial, inventory, permission, contractual | server-authoritative; reject conflict and retain evidence |
| Append-only operational note | append/deduplicate by mutation ID |
| Product-local noncritical preference | client value accepted only with a matching base version |
| Deletion | tombstone with retention; never silently resurrect |

The platform records accepted, duplicate, rejected and conflicted outcomes.
No wall-clock last-write-wins policy is permitted for protected entity classes.

## Telemetry and privacy

Heartbeats are non-blocking, rate-limited to one per installation per five
minutes and contain only installation ID, software version, lease state,
sync cursor/status, and coarse health. No customer content, identifiers,
financial data or raw logs are accepted. Missing heartbeats mean uncertainty,
not misuse. Retention is 30 days unless a security incident requires a
separately audited extension.

## Recovery and rollout

The previous compatible protocol remains enabled while a newer protocol rolls
out. Enforcement, telemetry, sync and event delivery are independently
disableable. During an outage an authorized staff member may issue an audited,
time-bounded emergency extension; it cannot bypass a security revocation.
Dead-lettered events and durable mutation outcomes remain replayable after
restoration.
