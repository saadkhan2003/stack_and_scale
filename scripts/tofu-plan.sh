#!/usr/bin/env bash
set -euo pipefail

environment="${1:?usage: scripts/tofu-plan.sh <staging|production>}"
shift || true
directory="infra/tofu/environments/${environment}"

if [[ ! -f "${directory}/backend.hcl" ]]; then
  echo "Refusing to plan: create ${directory}/backend.hcl from infra/tofu/backend.hcl.example outside Git." >&2
  exit 2
fi
if [[ ! -f "infra/tofu/${environment}.tfvars" || -z "${HCLOUD_TOKEN:-}" ]]; then
  echo "Refusing to plan: protected tfvars and HCLOUD_TOKEN are required." >&2
  exit 2
fi

tofu -chdir="${directory}" init -backend-config=backend.hcl
tofu -chdir="${directory}" plan -var-file="../../${environment}.tfvars" "$@"
