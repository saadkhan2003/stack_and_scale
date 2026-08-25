# Phase 05 — Identity, Tenancy and Authorization

## Outcome

Provide standards-based authentication, organization membership and server-enforced authorization for staff-facing V1 capabilities, with contracts ready for later client and product portals.

## Execution profile

- **Model tier:** strongest available reasoning model
- **Mode:** partially parallel with Phase 06 after shared data contracts freeze
- **External-platform spend:** $0 licence cost; self-hosted
- **Depends on:** Phase 04
- **Unlocks:** Phases 09, 11, 13, 15 and 16

## Work packages

### 05.1 Identity-provider evaluation

Compare suitable open-source OIDC/OAuth2 providers against:

- resource footprint on the $50 architecture;
- MFA, recovery, session and device capabilities;
- organization/federation support;
- administration and backup;
- upgrade and export path;
- security maintenance history.

Select one through an ADR; do not invent a custom password system.

### 05.2 Authentication integration

- Authorization Code flow with PKCE where appropriate.
- Secure cookie/token handling.
- Email verification and password recovery.
- Staff MFA policy.
- Session revocation and timeout behavior.

### 05.3 Organization and membership model

- User, organization, membership and role boundaries.
- Invitation and acceptance lifecycle.
- Multiple-organization membership.
- Suspension and offboarding.

### 05.4 Authorization policy layer

- Role permissions and controlled overrides.
- Resource relationship checks.
- Tenant-aware repository/query helpers.
- Service-account scopes.
- Deny-by-default behavior.

### 05.5 Tenant placement and routing

- Implement the Phase 03 tenant placement registry and routing abstraction.
- Launch V1 tenants on the approved shared tier, while preserving dedicated-schema/database adapters behind controlled provisioning paths.
- Ensure tenant context cannot be selected from an untrusted client identifier without membership/policy validation.
- Provide migration, tenant-move and isolated backup/restore runbooks before enabling a higher isolation tier.
- Test shared, dedicated-schema and dedicated-database routing using test tenants even if only shared production placement is initially active.

### 05.6 Audit and security controls

- Login, recovery, MFA, invitation, role and session events.
- Rate limiting and suspicious-attempt detection hooks.
- No tokens or passwords in application logs.

### 05.7 Security test suite

- Cross-tenant access attempts.
- Horizontal and vertical privilege escalation.
- Expired/revoked sessions.
- Invite replay and role manipulation.
- Direct API access when UI routes are hidden.

## Exit criteria

- Identity provider is selected through evidence and fits the budget.
- Staff sign-in and recovery work end to end.
- MFA can be required for privileged staff.
- Authorization tests prove cross-tenant denial.
- Every protected route has server-side policy enforcement.
- Identity backup and restore procedure exists.
- Placement-registry failure denies safely, and tests cover every supported isolation tier.

## Rollback and recovery

Keep application authorization separate from provider-specific identity data. A provider rollback must preserve internal user IDs and memberships and revoke unsafe sessions.

## Cold-start handoff

Read Questions 28, 32, 36, 40, 51, 82–84 and the Phase 03 threat model. Identity is not permission; application policies remain authoritative.
