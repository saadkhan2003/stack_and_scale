# Phase 14 Self-Hosted Storage, Scanning, and E-Sign Infrastructure

## Scope and default state

`infra/compose.production.yaml` defines private MinIO and ClamAV services under
the `phase14-storage` Compose profile on
the internal `storage` Docker network. Neither service publishes a host port or
has a Caddy route. The API is the only application service attached to that
network. ClamAV also has egress solely to retrieve signature updates; it has no
published listener. The API selects local storage and a pending scan hook unless the explicit
production environment configuration selects S3 and ClamAV.

`infra/compose.phase14-storage.yaml` is applied only by a storage-enabled
protected deployment. It mounts the MinIO application credentials into the API;
the normal production Compose model mounts no storage credentials and therefore
does not require storage secret files.

Documenso is defined in the `documenso` Compose profile and is disabled by
default. `sign.${PUBLIC_DOMAIN}` is its only edge route. Do not enable the
profile until the provider, jurisdiction, data-location, retention, callback,
DNS and capacity gates below have recorded evidence.

## Activation

1. On the production host, run
   `cd /opt/stack-and-scale && ENABLE_PHASE14_STORAGE=1 bash scripts/bootstrap-phase14-storage.sh`.
   It creates four distinct server-local MinIO credentials and changes only the
   private `.env.production` file. Store all four values from `secrets/` in a
   password manager; never commit or paste them.
2. Render before starting:

   ```bash
   docker compose --profile phase14-storage --env-file .env.production \
     -f infra/compose.production.yaml \
     -f infra/compose.phase14-storage.yaml config
   ```

   The `minio-init` job creates the bucket and attaches only object
   get/put/delete rights to the API identity.
3. Run the protected release workflow after the script changes the provider
   values.
   It detects the opt-in configuration, verifies all four server-local MinIO
   secret files, starts MinIO and ClamAV, waits for their health checks, and
   completes the bucket/least-privilege identity initialization before starting
   the API. Verify a clean upload, an EICAR quarantine
   test in an approved non-production environment, download authorization,
   object restore and retention before treating the lane as production-ready.
   The normal API deliberately does not depend on this opt-in profile; enable
   its S3 and ClamAV environment settings only after these checks pass.
4. For Documenso, set `DOCUMENSO_DATABASE_URL`, provision its two secrets, add
   the `sign` DNS record through the approved Cloudflare/origin process, then
   start with `--profile documenso`. Confirm the exact image release and
   environment names against the selected Documenso release documentation
   before deployment. The profile starts Documenso with its documented database
   upload transport; do not configure its S3 transport until its separate
   bucket, least-privilege service identity and retention policy are approved.

## Provider callback settings

The current API remains provider-neutral. Its callback endpoint is configured
as `DOCUMENSO_PROVIDER_CALLBACK_URL`, normally
`https://api.${PUBLIC_DOMAIN}/api/v1/contracts/provider-callback`; the API
adapter must be registered and both `ESIGN_PROVIDER_ENABLED` and
`ESIGN_PROVIDER_APPROVED` must be true before callbacks are accepted. Set
`ESIGN_PROVIDER_CALLBACK_SECRET` only in protected server configuration or a
secret manager. The Documenso webhook event selection, authentication format,
signer evidence mapping and replay test are provider integration work, not
completed by the Compose profile.

## External gates

- DNS for `sign.${PUBLIC_DOMAIN}`, Cloudflare routing and any origin
  certificate change require the domain operator.
- Legal suitability, jurisdiction-specific signature effect, terms, data
  processing, retention and data-location approval require authorized business
  and legal review. This repository makes no legal claim.
- Real resource measurements, backup/restore evidence, provider account setup
  and any recurring infrastructure budget approval require an operator.
