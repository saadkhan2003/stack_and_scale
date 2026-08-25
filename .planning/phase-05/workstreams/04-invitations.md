# WS04 — Invitation lifecycle endpoints

Goal: invite -> accept -> expire/revoke lifecycle backed by
identity.invitations.

Owns: apps/api/src/identity/invitations/invitation.service.ts,
invitation.controller.ts, invitation.module.ts,
apps/api/test/invitations.integration.test.ts.

Requirements:

- POST api/v1/organizations/:orgId/invitations requires member:invite and
  role-assign rules (use authorize() from @stack-and-scale/contracts with
  assigningRole). Stores SHA-256 token hash (node:crypto), never the raw
  token, expires in 7 days, unique per (org,email) pending.
- POST api/v1/invitations/:id/accept consumes token once; replay denied;
  expired/revoked denied with identical non-revealing 403 envelope.
- Reuse TenantAccessService pattern: explicit @Inject decorators, Fastify,
  correlation id from request. Follow error envelope of ApiExceptionFilter.
- Integration tests >= 5: create, accept happy path, replay denial, expired
  denial, insufficient role denial. Seed fixtures like
  test/tenant-authorization.integration.test.ts does.
