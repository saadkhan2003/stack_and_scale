# 01-01 — Runtime and Workspace Policy

## Outcome

Establish pinned Node/pnpm policy, root workspace structure, secret-safe ignore rules and contributor commands.

## Inputs

Phase 00 authority, V1 scope, environment/delivery policy, secrets ADR, Phase 01 plan, official Node/Next/Payload/Nest compatibility references.

## Ownership

Own root runtime/workspace/configuration documentation and ignore/editor files. Do not create application business logic, cloud resources or production credentials.

## Actions

Pin Node 24 LTS and pnpm 11.19.0; create workspace package policy, dependency/update policy, `.gitignore`, `.editorconfig`, `.env.example` without values and initial directory ownership.

## Compatibility, cost and rollback

No API/schema impact and $0 recurring cost. Revert root policy files together if the selected baseline fails; preserve the compatibility record.

## Verification and evidence

Verify engines/package-manager policy, no secret file tracked, workspace discovery and documented bootstrap commands. Evidence: `docs/evidence/phase-01/01-01/`.

## Merge order

First Phase 01 implementation step.

