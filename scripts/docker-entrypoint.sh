#!/bin/sh
set -eu

mkdir -p /app/data
npx prisma migrate deploy
npx prisma db seed
exec npm start
