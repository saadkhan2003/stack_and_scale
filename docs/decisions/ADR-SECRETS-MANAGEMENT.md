# ADR — Secrets Management Baseline

**Status:** Accepted for Phase 00; Phase 01 baseline selected, production validation gated in Phase 10B.

## Context

The platform must keep application, infrastructure, backup, identity, webhook and recovery secrets out of source code and logs while remaining operable by a small team under USD 50/month. Encrypted files alone are insufficient if access, custody or recovery is undocumented.

## Decision

Use **SOPS plus age** as the Phase 01 local/development baseline. Production validation occurs in Phase 10B; if the following controls cannot be demonstrated, replace it through an ADR with a lightweight secrets service that provides equivalent or stronger controls within the budget.

- Separate production, staging and development recipients and encrypted secret material.
- Named custodians and least-privilege recipient access; no shared personal key as the only recovery path.
- Access approval/evidence procedure, including who may decrypt production material and when.
- Rotation register for application, backup, identity, webhook and recovery secrets.
- Break-glass procedure requiring incident record and post-use rotation.
- Protected recovery of decryption keys through separately held, documented escrow/custody; no key material in the application server or repository.
- Secret scanning, log redaction and incident response for suspected exposure.

## Phase 01 operating workflow

- The security owner is the company owner until a dedicated security owner is assigned; two named custodians are required before production secrets exist.
- Development secrets use a local untracked `.env.local` created from a non-secret example file; they are never committed, uploaded as evidence or reused for staging/production.
- SOPS-encrypted configuration uses separate age recipients for development, staging and production. Development decrypt access is limited to contributors who need it; staging/production decrypt access requires recorded approval by the security owner.
- Access evidence is a dated entry in the private operational access log identifying requester, purpose, environment, approver and expiry. The log contains no secret values or private keys.
- Production recipients, encrypted production files and recovery material are not created in Phase 01; Phase 10B establishes them only after the custodian and recovery drill passes.

## Consequences

- There is no automatic claim that SOPS itself provides runtime access auditing; operational access evidence and compensating controls are mandatory.
- A provider/service that cannot meet custody, rotation and recovery needs is rejected even if it is free.
- Phase 10B must add implementation runbooks and Phase 11B must rehearse rotation/recovery.

## Verification

Before V1: prove a non-production decrypt/rotation/recovery drill, prove production secret material is absent from Git/logs/images, and record the approved custodian list without placing their private keys in this repository.
