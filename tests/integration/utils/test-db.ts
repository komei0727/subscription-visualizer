import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { randomBytes } from 'crypto'

let prisma: PrismaClient

export function getTestDatabaseUrl(): string {
  // Use TEST_DATABASE_URL if provided (for Docker setup)
  if (process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL
  }

  const dbName = `test_${randomBytes(4).toString('hex')}`
  const baseUrl =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@127.0.0.1:5433/test_db'
  const url = new URL(baseUrl)
  url.pathname = `/${dbName}`
  return url.toString()
}

export async function setupTestDatabase(): Promise<PrismaClient> {
  const testDbUrl = getTestDatabaseUrl()
  process.env.DATABASE_URL = testDbUrl

  // Skip database creation if using TEST_DATABASE_URL (already exists)
  if (!process.env.TEST_DATABASE_URL) {
    try {
      // Create test database
      execSync(
        `DATABASE_URL="${testDbUrl}" npx prisma db push --skip-generate --force-reset`,
        {
          env: { ...process.env, DATABASE_URL: testDbUrl },
          stdio: 'ignore', // Suppress output for cleaner test runs
        }
      )
    } catch (error) {
      console.error(
        'Failed to setup test database. Ensure PostgreSQL is running.'
      )
      throw error
    }
  }

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDbUrl,
      },
    },
  })

  await prisma.$connect()
  return prisma
}

export async function teardownTestDatabase(): Promise<void> {
  if (!prisma) return

  const databaseUrl = new URL(process.env.DATABASE_URL!)
  const dbName = databaseUrl.pathname.slice(1)

  await prisma.$disconnect()

  // Drop test database
  const baseUrl = process.env.DATABASE_URL!.replace(
    databaseUrl.pathname,
    '/postgres'
  )
  try {
    execSync(`psql "${baseUrl}" -c "DROP DATABASE IF EXISTS ${dbName}"`)
  } catch (error) {
    // If psql is not available, try using prisma migrate reset as fallback
    console.warn(
      'psql not found, skipping database drop. Database will be cleaned up on next run.'
    )
  }
}

export async function cleanupDatabase(): Promise<void> {
  if (!prisma) return

  // Clean up in correct order to respect foreign key constraints
  await prisma.payment.deleteMany()
  await prisma.reminder.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.notificationPreference.deleteMany()
  await prisma.userCategory.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()
}

export { prisma }
