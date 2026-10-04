#!/usr/bin/env bash
set -Eeuo pipefail

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
cd "$DEPLOY_PATH"

git fetch origin main
git reset --hard origin/main

# Muat env sebelum build agar halaman statis (profil-sekolah) bisa query DB
# saat prerender; nilai di-parse per baris agar karakter khusus aman.
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    ''|'#'*) continue ;;
  esac
  key="${line%%=*}"
  value="${line#*=}"
  case "$key" in
    *[!A-Za-z0-9_]*) continue ;;
  esac
  export "$key"="$value"
done < ./.env.production

npm ci
npm run build

# Data cache (unstable_cache) bertahan antar-build dan tidak melihat perubahan
# dari seed/migrasi manual; bersihkan agar halaman publik selalu segar.
rm -rf .next/cache

npx drizzle-kit migrate
sudo -n /usr/bin/systemctl restart pm2-cibione
sudo -n /usr/bin/systemctl is-active --quiet pm2-cibione
for attempt in 1 2 3 4 5; do
  curl --fail --silent --show-error --max-time 10 http://127.0.0.1:3000/ > /dev/null && exit 0
  sleep 2
done
echo "Application health check failed" >&2
exit 1
