#!/bin/sh
set -e

echo "Installing dependencies..."
npm install

echo "Starting application..."
exec npm run dev
