#!/bin/bash

# Script to run integration tests in CI environment (GitHub Actions)

set -e

echo "🚀 Running integration tests in CI..."

# Load environment variables
export DATABASE_URL=$DATABASE_URL
export NEXTAUTH_URL=$NEXTAUTH_URL
export NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Run Prisma migrations
echo "🔧 Setting up test database schema..."
npx prisma db push --force-reset

# Run integration tests
echo "🧪 Running integration tests..."
pnpm test:integration

# Capture test exit code
TEST_EXIT_CODE=$?

# Exit with test exit code
exit $TEST_EXIT_CODE