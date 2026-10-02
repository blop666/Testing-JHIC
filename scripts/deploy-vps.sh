#!/usr/bin/env bash
set -Eeuo pipefail

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
cd "$DEPLOY_PATH"

git pull --ff-only origin main
npm ci
npm run build

set -a
. ./.env.production
set +a

npx drizzle-kit migrate
sudo systemctl restart pm2-cibione
sudo systemctl is-active --quiet pm2-cibione
for attempt in 1 2 3 4 5; do
  curl --fail --silent --show-error --max-time 10 http://127.0.0.1:3000/ > /dev/null && exit 0
  sleep 2
done
echo "Application health check failed" >&2
exit 1
