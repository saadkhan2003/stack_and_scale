#!/usr/bin/env bash
set -euo pipefail

database_host="${DATABASE_PRIVATE_HOST:?set DATABASE_PRIVATE_HOST}"
database_user="${DATABASE_DEPLOY_USER:?set DATABASE_DEPLOY_USER}"
bastion_host="${APP_DEPLOY_HOST:?set APP_DEPLOY_HOST}"
bastion_user="${APP_DEPLOY_USER:?set APP_DEPLOY_USER}"

if [[ ! -f .env.database.production ]]; then
  echo "Refusing database bootstrap: create an untracked .env.database.production first." >&2
  exit 2
fi

remote="${database_user}@${database_host}"
bastion="${bastion_user}@${bastion_host}"
remote_root="/opt/stack-and-scale"
rsync -e "ssh -J ${bastion}" -az --delete infra/ "${remote}:${remote_root}/infra/"
rsync -e "ssh -J ${bastion}" -az .env.database.production "${remote}:${remote_root}/.env.database.production"
ssh -J "${bastion}" "${remote}" "docker compose --env-file ${remote_root}/.env.database.production -f ${remote_root}/infra/compose.database.production.yaml up -d"
echo "Database bootstrap completed. Verify it only accepts private-network clients before application deployment."
