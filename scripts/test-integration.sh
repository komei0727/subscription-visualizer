#!/bin/bash

# Script to run integration tests with Docker PostgreSQL

set -e

echo "🚀 Starting integration tests with Docker..."

# Start PostgreSQL container
echo "📦 Starting PostgreSQL container..."
docker-compose -f docker-compose.test.yml up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
until docker exec subscription-visualizer-test-db pg_isready -U postgres > /dev/null 2>&1; do
  ATTEMPT=$((ATTEMPT+1))
  if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
    echo "❌ PostgreSQL failed to start after $MAX_ATTEMPTS attempts"
    docker-compose -f docker-compose.test.yml logs postgres-test
    exit 1
  fi
  echo "   Waiting for PostgreSQL... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Additional wait to ensure database is fully initialized
sleep 2

# Copy test environment file
if [ ! -f .env.test ]; then
  echo "📝 Creating .env.test file..."
  cp .env.test.example .env.test
fi

# Set test database URL
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/test_db"
export TEST_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/test_db"

# Run Prisma migrations
echo "🔧 Setting up test database schema..."
npx prisma db push --force-reset --skip-generate

# Run integration tests
echo "🧪 Running integration tests..."
pnpm test:integration

# Capture test exit code
TEST_EXIT_CODE=$?

# Clean up
echo "🧹 Cleaning up..."
docker-compose -f docker-compose.test.yml down -v

# Exit with test exit code
exit $TEST_EXIT_CODE