#!/usr/bin/env bash
set -euo pipefail

environment="${1:?usage: scripts/deploy-promote.sh <staging|production> <immutable-image-tag>}"
image_tag="${2:?usage: scripts/deploy-promote.sh <staging|production> <immutable-image-tag>}"

if [[ ! "${image_tag}" =~ ^[a-f0-9]{7,64}$ ]]; then
  echo "Refusing deployment: image tag must be an immutable commit SHA." >&2
  exit 2
fi
if [[ -z "${DEPLOY_HOST:-}" || -z "${DEPLOY_USER:-}" || -z "${IMAGE_REGISTRY:-}" || -z "${REGISTRY_READ_USER:-}" || -z "${REGISTRY_READ_TOKEN:-}" ]]; then
  echo "Refusing deployment: host, registry and least-privilege registry-read credentials are required." >&2
  exit 2
fi
if [[ "${environment}" == "production" && "${CONFIRM_PRODUCTION_DEPLOY:-}" != "${image_tag}" ]]; then
  echo "Refusing production deployment: set CONFIRM_PRODUCTION_DEPLOY=${image_tag} after release approval." >&2
  exit 2
fi

remote="${DEPLOY_USER}@${DEPLOY_HOST}"
remote_root="/opt/stack-and-scale"
observability_enabled="${ENABLE_OBSERVABILITY:-0}"
if [[ "${observability_enabled}" != "0" && "${observability_enabled}" != "1" ]]; then
  echo "Refusing deployment: ENABLE_OBSERVABILITY must be 0 or 1." >&2
  exit 2
fi
ssh "${remote}" "test -s ${remote_root}/secrets/cloudflare-origin.crt && test -s ${remote_root}/secrets/cloudflare-origin.key" || {
  echo "Refusing deployment: Cloudflare Origin Certificate files are missing from ${remote_root}/secrets/." >&2
  exit 2
}

# Synchronize only deployment configuration. Target-host secret files are never
# copied from CI or a developer machine.
rsync -az --delete infra/ "${remote}:${remote_root}/infra/"
rsync -az scripts/backup-production.sh "${remote}:${remote_root}/scripts/backup-production.sh"
ssh "${remote}" "chmod 0750 ${remote_root}/scripts/backup-production.sh"
compose="IMAGE_TAG=${image_tag} IMAGE_REGISTRY=${IMAGE_REGISTRY} docker compose --env-file ${remote_root}/.env.production -f ${remote_root}/infra/compose.production.yaml"
if [[ "${observability_enabled}" == "1" ]]; then
  ssh "${remote}" "test -s ${remote_root}/secrets/metrics-bearer-token && test -s ${remote_root}/secrets/grafana-admin-password" || {
    echo "Refusing observability deployment: protected metrics and Grafana secret files are missing." >&2
    exit 2
  }
  compose+=" -f ${remote_root}/infra/compose.observability.yaml"
fi
printf '%s' "${REGISTRY_READ_TOKEN}" | ssh "${remote}" "docker login $(printf '%q' "${IMAGE_REGISTRY%%/*}") --username $(printf '%q' "${REGISTRY_READ_USER}") --password-stdin"

previous_tag="$(ssh "${remote}" "test -f ${remote_root}/deployments/current.json && sed -n 's/.*\"imageTag\":\"\([a-f0-9]*\)\".*/\1/p' ${remote_root}/deployments/current.json" || true)"
rollback_on_failure() {
  local status=$?
  if [[ -n "${previous_tag}" && "${previous_tag}" != "${image_tag}" ]]; then
    echo "Promotion check failed; restoring previous compatible image ${previous_tag}." >&2
    ssh "${remote}" "IMAGE_TAG=${previous_tag} IMAGE_REGISTRY=${IMAGE_REGISTRY} docker compose --env-file ${remote_root}/.env.production -f ${remote_root}/infra/compose.production.yaml up -d web api cms workers keycloak" || true
  else
    echo "Promotion check failed before a known-good release was available." >&2
  fi
  exit "${status}"
}
trap rollback_on_failure ERR
ssh "${remote}" "${compose} pull"
ssh "${remote}" "${compose} up -d postgres"
ssh "${remote}" "for attempt in \$(seq 1 20); do ${compose} exec -T postgres pg_isready -U \"\$POSTGRES_USER\" -d stack_and_scale && break; test \$attempt -eq 20 && exit 1; sleep 3; done"
# tsconfig.build.json emits the database package source directly into dist/.
# Keep this in sync with packages/database/tsconfig.build.json; using dist/src
# would make a first production release stop after PostgreSQL is healthy.
ssh "${remote}" "${compose} run --rm api node packages/database/dist/migrate.js"
ssh "${remote}" "${compose} up -d caddy web api cms workers keycloak postgres"
if [[ "${observability_enabled}" == "1" ]]; then
  ssh "${remote}" "${compose} up -d prometheus loki promtail grafana node-exporter cadvisor"
fi
ssh "${remote}" "for attempt in \$(seq 1 12); do ${compose} exec -T api node -e \"fetch('http://127.0.0.1:3100/ready').then(r => process.exit(r.ok ? 0 : 1))\" && break; test \$attempt -eq 12 && exit 1; sleep 3; done"
ssh "${remote}" "${compose} exec -T web node -e \"fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1))\""
ssh "${remote}" "${compose} exec -T web node -e \"fetch('http://127.0.0.1:3000/api/demo-slots').then(r => process.exit(r.ok ? 0 : 1))\""
# Keycloak and Payload can take longer than the API to warm up on a modest
# single-host VPS. Wait for their Docker health checks instead of accepting a
# deployment while the CMS or identity provider is still restarting.
ssh "${remote}" "for attempt in \$(seq 1 30); do docker inspect --format '{{.State.Health.Status}}' stack-and-scale-production-cms-1 | grep -qx healthy && break; test \$attempt -eq 30 && exit 1; sleep 3; done"
ssh "${remote}" "for attempt in \$(seq 1 30); do docker inspect --format '{{.State.Health.Status}}' stack-and-scale-production-keycloak-1 | grep -qx healthy && break; test \$attempt -eq 30 && exit 1; sleep 3; done"
ssh "${remote}" "docker inspect --format '{{.State.Running}}' stack-and-scale-production-caddy-1 | grep -qx true"
schema_version="$(ssh "${remote}" "${compose} exec -T api node -e \"const fs=require('fs'); const files=fs.readdirSync('packages/database/migrations').filter(f=>/^[0-9]+.*\\.sql$/.test(f)).sort(); process.stdout.write(files.at(-1) || 'unknown')\"" || true)"
ssh "${remote}" "mkdir -p ${remote_root}/deployments && printf '%s\\n' '{\"environment\":\"${environment}\",\"imageTag\":\"${image_tag}\",\"schemaVersion\":\"${schema_version:-unknown}\"}' | tee ${remote_root}/deployments/${image_tag}.json > ${remote_root}/deployments/current.json"
trap - ERR
echo "Promotion completed: ${environment} ${image_tag}"
