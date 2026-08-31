# Phase 16.6 — releases and downloads

- Releases require an active, time-valid signing key, a SHA-256 checksum and
  signature metadata. Every authorized download attempt creates an audit event.
- The integration suite verifies the audit event and that revoking the signing
  key blocks subsequent download authorization.
- The download capability intentionally remains `null`: private object storage,
  malware scanning and short-lived signed URLs have not been independently
  configured. Consequently this release exposes no permanent public URL.
