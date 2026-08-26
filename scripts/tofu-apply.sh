#!/usr/bin/env bash
set -euo pipefail

environment="${1:?usage: scripts/tofu-apply.sh <staging|production>}"
if [[ "${CONFIRM_INFRA_APPLY:-}" != "${environment}" ]]; then
  echo "Refusing to apply. Set CONFIRM_INFRA_APPLY=${environment} after reviewed plan approval." >&2
  exit 2
fi

scripts/tofu-plan.sh "${environment}"
tofu -chdir="infra/tofu/environments/${environment}" apply -var-file="../../${environment}.tfvars"
