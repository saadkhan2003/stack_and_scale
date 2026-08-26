#!/usr/bin/env bash
set -euo pipefail

if [[ "${CONFIRM_STAGING_DESTROY:-}" != "staging" ]]; then
  echo "Refusing destroy. Set CONFIRM_STAGING_DESTROY=staging after exporting evidence." >&2
  exit 2
fi

scripts/tofu-plan.sh staging
tofu -chdir="infra/tofu/environments/staging" destroy -var-file="../../staging.tfvars"
