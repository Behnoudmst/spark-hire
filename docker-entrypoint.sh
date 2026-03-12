#!/bin/sh
set -e

echo "→ Running database migrations…"
npx prisma migrate deploy

echo "→ Seeding database…"
./node_modules/.bin/tsx scripts/seed.ts

echo "→ Starting Next.js…"
exec node server.js
