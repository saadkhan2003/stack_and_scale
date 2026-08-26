#!/usr/bin/env bash
set -euo pipefail

environment="${1:?usage: scripts/tofu-drift.sh <staging|production>}"
if [[ "${environment}" != "staging" && "${environment}" != "production" ]]; then
  echo "Refusing drift check: environment must be staging or production." >&2
  exit 2
fi

set +e
scripts/tofu-plan.sh "${environment}" -detailed-exitcode
result=$?
set -e

case "${result}" in
  0) echo "No infrastructure drift: ${environment}" ;;
  2) echo "Infrastructure drift detected: ${environment}. Review before any apply." >&2; exit 2 ;;
  *) exit "${result}" ;;
esac
