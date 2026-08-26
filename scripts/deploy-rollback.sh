#!/usr/bin/env bash
set -euo pipefail

environment="${1:?usage: scripts/deploy-rollback.sh <staging|production> <previous-immutable-image-tag>}"
previous_tag="${2:?usage: scripts/deploy-rollback.sh <staging|production> <previous-immutable-image-tag>}"

if [[ "${environment}" == "production" && "${CONFIRM_PRODUCTION_ROLLBACK:-}" != "${previous_tag}" ]]; then
  echo "Refusing production rollback: set CONFIRM_PRODUCTION_ROLLBACK=${previous_tag}." >&2
  exit 2
fi
DEPLOY_HOST="${DEPLOY_HOST:?set DEPLOY_HOST}" DEPLOY_USER="${DEPLOY_USER:?set DEPLOY_USER}" IMAGE_REGISTRY="${IMAGE_REGISTRY:?set IMAGE_REGISTRY}" CONFIRM_PRODUCTION_DEPLOY="${previous_tag}" scripts/deploy-promote.sh "${environment}" "${previous_tag}"
