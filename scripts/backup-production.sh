#!/usr/bin/env bash
set -euo pipefail

# Runs on the production host. It creates an encrypted restic backup of a
# PostgreSQL-consistent logical export plus reviewed recovery artifacts. It
# intentionally does not accept backup credentials on the command line.

readonly app_root="${STACK_AND_SCALE_ROOT:-/opt/stack-and-scale}"
readonly compose_file="${app_root}/infra/compose.production.yaml"
readonly env_file="${app_root}/.env.production"
readonly state_dir="${BACKUP_STATE_DIR:-/var/lib/stack-and-scale/monitoring}"
readonly restic_password_file="${RESTIC_PASSWORD_FILE:?set RESTIC_PASSWORD_FILE to an independently protected file}"
: "${RESTIC_REPOSITORY:?set RESTIC_REPOSITORY to the independent encrypted backup repository}"

if [[ ! -r "${restic_password_file}" ]]; then
  echo "Refusing backup: RESTIC_PASSWORD_FILE is unreadable." >&2
  exit 2
fi
if ! command -v restic >/dev/null; then
  echo "Refusing backup: restic is not installed on this host." >&2
  exit 2
fi
if [[ ! -f "${compose_file}" || ! -f "${env_file}" ]]; then
  echo "Refusing backup: Stack & Scale deployment files are missing." >&2
  exit 2
fi

readonly backup_dir="$(mktemp -d)"
cleanup() { rm -rf "${backup_dir}"; }
trap cleanup EXIT

compose=(docker compose --env-file "${env_file}" -f "${compose_file}")
mkdir -p "${state_dir}"

"${compose[@]}" exec -T postgres pg_dumpall --clean --if-exists --no-role-passwords \
  >"${backup_dir}/postgresql.sql"

tar --create --file "${backup_dir}/deployment-artifacts.tar" \
  --directory "${app_root}" \
  infra deployments \
  --exclude='infra/tofu/**/.terraform' \
  --exclude='infra/tofu/**/*.tfstate' \
  --exclude='infra/**/.env*'

if [[ -n "${BACKUP_MEDIA_PATH:-}" ]]; then
  if [[ ! -d "${BACKUP_MEDIA_PATH}" ]]; then
    echo "Refusing backup: BACKUP_MEDIA_PATH is not a directory." >&2
    exit 2
  fi
  tar --create --file "${backup_dir}/media.tar" --directory "${BACKUP_MEDIA_PATH}" .
fi

export RESTIC_REPOSITORY
export RESTIC_PASSWORD_FILE="${restic_password_file}"
restic backup "${backup_dir}" --tag stack-and-scale --tag production
restic forget --prune --keep-daily 14 --keep-weekly 8 --keep-monthly 12
restic check --read-data-subset=5%

now="$(date +%s)"
tmp_status="${state_dir}/backup-last-success.prom.tmp"
printf '%s\n' \
  '# HELP stack_and_scale_backup_last_success_unixtime Unix timestamp of the most recent verified encrypted backup.' \
  '# TYPE stack_and_scale_backup_last_success_unixtime gauge' \
  "stack_and_scale_backup_last_success_unixtime ${now}" >"${tmp_status}"
mv "${tmp_status}" "${state_dir}/backup-last-success.prom"
echo "Backup succeeded at ${now}."
