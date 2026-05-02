#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_WWWROOT_DIR="${ROOT_DIR}/../KumaruLanka.API/wwwroot"

KL_API_BASE="${KL_API_BASE:-http://localhost:5080/api}"

echo "Building Next.js static export…"
echo "KL_API_BASE=${KL_API_BASE}"

cd "${ROOT_DIR}"

# Next.js server components (generateStaticParams) fetch from KL_API_BASE at build time
KL_API_BASE="${KL_API_BASE}" npm run build

if [[ ! -d "${ROOT_DIR}/out" ]]; then
  echo "Expected '${ROOT_DIR}/out' to exist after build (static export)."
  exit 1
fi

echo "Syncing to ASP.NET wwwroot…"
mkdir -p "${API_WWWROOT_DIR}"
rm -rf "${API_WWWROOT_DIR:?}/"*
cp -R "${ROOT_DIR}/out/." "${API_WWWROOT_DIR}/"

echo "Done."
