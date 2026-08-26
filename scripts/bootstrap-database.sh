#!/usr/bin/env bash
set -euo pipefail

database_host="${DATABASE_DEPLOY_HOST:?set DATABASE_DEPLOY_HOST}"
database_user="${DATABASE_DEPLOY_USER:?set DATABASE_DEPLOY_USER}"

if [[ ! -f .env.database.production ]]; then
  echo "Refusing database bootstrap: create an untracked .env.database.production first." >&2
  exit 2
fi

remote="${database_user}@${database_host}"
remote_root="/opt/stack-and-scale"
rsync -az --delete infra/ "${remote}:${remote_root}/infra/"
rsync -az .env.database.production "${remote}:${remote_root}/.env.database.production"
ssh "${remote}" "docker compose --env-file ${remote_root}/.env.database.production -f ${remote_root}/infra/compose.database.production.yaml up -d"
echo "Database bootstrap completed. Verify it only accepts private-network clients before application deployment."
