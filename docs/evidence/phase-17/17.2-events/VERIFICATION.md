# 17.2 Signed event delivery verification

Lease issuance creates a canonical-JSON Ed25519-signed event and a durable,
installation-scoped delivery record. The focused suite verifies signature
validation, acknowledgement, at-least-once deduplication, exponential retry,
dead-letter state and authorized replay. Event order is not used as a safety
mechanism; the SDK accepts valid reordered IDs independently.
