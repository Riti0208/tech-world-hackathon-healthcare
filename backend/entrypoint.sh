#!/bin/sh
set -e

echo "Installing dependencies..."
npm install

echo "Waiting for database to be ready..."
sleep 5

echo "Generating Prisma Client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push

echo "Starting application..."
exec npm run dev
