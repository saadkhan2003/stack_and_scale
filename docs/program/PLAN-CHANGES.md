# Plan Change Log

No changes recorded at Phase 00 start.

## PC-2026-08-27-OVH-PRODUCTION-HOST

- **Date:** 2026-08-27
- **Proposer / approver:** Project owner
- **Affected question decisions:** Q026–Q027, Q048–Q050, Q078–Q082, Q096, Q098
- **Affected requirements and execution steps:** `REQ-OPS-001`, `V1-09`,
  `V1-10`, Phase 10B, Phase 11B and Phase 12 production verification
- **Evidence / reason:** Hetzner had no available 8 GB shared-resource
  instance in the owner's project. The owner purchased an OVHcloud VPS-2 in
  London (UK): 4 vCores, 8 GB RAM, 75 GB NVMe, automatic daily backup and no
  long-term commitment at the recorded USD 10/month price before tax.
- **Previous direction:** One Hetzner CX33 in Falkenstein, provisioned through
  the Hetzner OpenTofu module.
- **New direction:** One owner-managed OVHcloud VPS-2 in London (UK), with the
  same internal-only Docker PostgreSQL topology. Cloudflare remains the edge.
  The existing Hetzner OpenTofu module must not be applied to this OVH host.
- **Dependency impact:** OVH host bootstrap, host firewall, backup and
  deployment evidence replace the unperformed Hetzner production apply.
  Provider-neutral application Compose/deploy artifacts remain valid.
- **Security / privacy / data impact:** SSH is key-only; UFW currently permits
  SSH only; production web ports, Cloudflare origin restriction, encrypted
  independent backups, alert routing and restore testing remain mandatory
  before launch.
- **Budget / capacity impact:** Recorded compute cost is USD 10/month before
  tax. The 8 GB single-host capacity allocation remains unchanged and the USD
  50/month authority ceiling remains binding.
- **Migration and rollback:** No application data exists on the new host.
  A future move to Hetzner or another provider uses an isolated restore,
  validation, Cloudflare DNS cutover and a retained old-host rollback window.
- **Verification required:** Complete the OVH-specific Phase 10–12 external
  gates in the launch trace; do not mark production launch complete from this
  provider decision alone.
- **Status:** Accepted and implemented as host selection; operational gates
  remain open.

## Entry template

```text
ID:
Date:
Proposer:
Approver:
Affected question decisions:
Affected requirements and execution steps:
Evidence/reason:
Previous direction:
New direction:
Dependency impact:
Security/privacy/data impact:
Budget/capacity impact:
Migration and rollback:
Verification required:
Status:
```

Use this log for split, insert, reorder, defer, replace or abandon decisions. Link an ADR when architecture or provider choice changes.
