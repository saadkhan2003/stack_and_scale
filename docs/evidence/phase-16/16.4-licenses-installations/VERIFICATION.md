# Phase 16.4 — licenses and installations

- Licenses and installations are organization-scoped, with installation status
  transitions and monotonic lease sequences.
- The PostgreSQL integration suite accepts the first lease and rejects a replay
  of the same sequence. Lease and download routes require a sensitive session
  in production; the test adapter uses its explicit test actor path.
- Signing-key metadata has validity windows and status controls. A protected
  production provisioning run installed only the private signing material on
  the host and registered the public metadata.
