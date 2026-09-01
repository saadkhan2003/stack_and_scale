# 17.3 Installation trust and lease verification

Credentials are 256-bit random values stored only as SHA-256 hashes, rotate by
replacing an active credential, and can be revoked. Leases are installation-
bound, Ed25519-signed, sequenced, expire after 24 hours and have a separate
24-hour outage grace. The API suite verifies credential revocation and refusal
to issue a new lease from a revoked signing key. The SDK rejects decreasing
sequences and revoked key metadata.
