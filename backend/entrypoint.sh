#!/bin/sh
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Generating Prisma Client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy || npx prisma migrate dev --name init

echo "Starting application..."
exec npm run dev
