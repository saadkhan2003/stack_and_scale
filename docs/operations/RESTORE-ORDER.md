# Complete-System Restore Order

## Objective

Restore service safely without recreating an insecure or inconsistent environment. Exact RPO/RTO targets are accepted in Phase 03 and measured in Phases 10B/11B.

## Recovery order

1. Declare incident, preserve evidence, assess whether writes must stop and publish an independent status update.
2. Recover access to separately protected recovery keys and break-glass credentials under the secrets ADR.
3. Restore/recreate infrastructure state and private networking from reviewed IaC state; validate firewall and edge/origin controls before application exposure.
4. Restore database to an isolated environment from a consistent backup and apply tested point-in-time logs where adopted.
5. Restore identity-provider data and validate staff access/MFA/revocation before opening privileged applications.
6. Restore application configuration, approved secrets references, CMS data, media/files and object-storage metadata; verify private access boundaries.
7. Deploy the verified immutable application release compatible with the restored schema.
8. Restore monitoring, alert routing and independent status configuration; confirm external detection works.
9. Run security, tenant, privacy, lead, CMS and business smoke tests; compare record counts and audit evidence.
10. Resume writes/traffic only after the designated incident owner approves; document actual RPO/RTO, data gaps and follow-up actions.

## Backup coverage rule

Coverage includes database, point-in-time logs where adopted, identity data, CMS/configuration, media/files, IaC state, monitoring/status configuration and protected key-recovery material. The protected backup target must be geographically separate from the primary OVHcloud London (UK) location and use independent credentials or account separation.
