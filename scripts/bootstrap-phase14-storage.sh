#!/usr/bin/env bash
set -euo pipefail

# Run only on the production host, after the Phase 14 infrastructure release
# is deployed. It creates storage credentials locally and switches the host
# environment to the explicit S3/ClamAV mode without ever printing secrets.

readonly app_root="${STACK_AND_SCALE_ROOT:-/opt/stack-and-scale}"
readonly env_file="${app_root}/.env.production"
readonly secrets_dir="${app_root}/secrets"
readonly bucket="${PRIVATE_STORAGE_S3_BUCKET:-stack-and-scale-private}"

if [[ "${ENABLE_PHASE14_STORAGE:-}" != "1" ]]; then
  echo "Refusing setup: set ENABLE_PHASE14_STORAGE=1 after reviewing the Phase 14 activation runbook." >&2
  exit 2
fi
if [[ ! -f "${env_file}" ]]; then
  echo "Refusing setup: ${env_file} does not exist." >&2
  exit 2
fi
if [[ ! "${bucket}" =~ ^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$ ]]; then
  echo "Refusing setup: PRIVATE_STORAGE_S3_BUCKET must be a valid private S3 bucket name." >&2
  exit 2
fi
if grep -qx 'PRIVATE_STORAGE_PROVIDER=s3' "${env_file}" || grep -qx 'MALWARE_SCAN_PROVIDER=clamav' "${env_file}"; then
  echo "Refusing setup: storage is already enabled; use the documented rotation procedure instead." >&2
  exit 2
fi

for command in install openssl grep sed; do
  command -v "${command}" >/dev/null || {
    echo "Refusing setup: ${command} is required." >&2
    exit 2
  }
done

install -d -m 0750 "${secrets_dir}"
for name in minio-root-user minio-root-password minio-api-access-key minio-api-secret-key; do
  if [[ -e "${secrets_dir}/${name}" ]]; then
    echo "Refusing setup: ${secrets_dir}/${name} already exists; do not overwrite a production credential." >&2
    exit 2
  fi
done

umask 077
openssl rand -hex 10 >"${secrets_dir}/minio-root-user"
openssl rand -hex 20 >"${secrets_dir}/minio-root-password"
openssl rand -hex 10 >"${secrets_dir}/minio-api-access-key"
openssl rand -hex 20 >"${secrets_dir}/minio-api-secret-key"
chmod 0600 "${secrets_dir}/minio-root-user" "${secrets_dir}/minio-root-password" \
  "${secrets_dir}/minio-api-access-key" "${secrets_dir}/minio-api-secret-key"

set_environment() {
  local name="$1"
  local value="$2"
  if grep -q "^${name}=" "${env_file}"; then
    sed -i "s|^${name}=.*|${name}=${value}|" "${env_file}"
  else
    printf '\n%s=%s\n' "${name}" "${value}" >>"${env_file}"
  fi
}

set_environment PRIVATE_STORAGE_PROVIDER s3
set_environment PRIVATE_STORAGE_S3_ENDPOINT http://minio:9000
set_environment PRIVATE_STORAGE_S3_REGION us-east-1
set_environment PRIVATE_STORAGE_S3_BUCKET "${bucket}"
set_environment PRIVATE_STORAGE_S3_ACCESS_KEY_FILE /run/secrets/minio_api_access_key
set_environment PRIVATE_STORAGE_S3_SECRET_KEY_FILE /run/secrets/minio_api_secret_key
set_environment PRIVATE_STORAGE_S3_FORCE_PATH_STYLE true
set_environment MALWARE_SCAN_PROVIDER clamav
set_environment CLAMAV_HOST clamav
set_environment CLAMAV_PORT 3310
set_environment CLAMAV_TIMEOUT_MS 30000
chmod 0600 "${env_file}"

echo "Phase 14 storage configuration is prepared locally."
echo "Before deployment, store all four values in ${secrets_dir}/ in a password manager."
echo "Do not paste the values into chat, GitHub, email, or the repository."
