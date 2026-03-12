#!/bin/sh
set -e

echo "→ Running database migrations…"
npx prisma migrate deploy

echo "→ Starting Next.js…"
exec node server.js
