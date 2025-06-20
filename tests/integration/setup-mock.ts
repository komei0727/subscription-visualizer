// Mock setup for integration tests when database is not available
import { jest } from '@jest/globals'

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    subscription: {
      create: jest.fn(),
      createMany: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    reminder: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    account: {
      deleteMany: jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
    notificationPreference: {
      deleteMany: jest.fn(),
    },
    userCategory: {
      deleteMany: jest.fn(),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    BillingCycle: {
      DAILY: 'DAILY',
      WEEKLY: 'WEEKLY',
      MONTHLY: 'MONTHLY',
      QUARTERLY: 'QUARTERLY',
      SEMI_ANNUAL: 'SEMI_ANNUAL',
      YEARLY: 'YEARLY',
      LIFETIME: 'LIFETIME',
      CUSTOM: 'CUSTOM',
    },
    Category: {
      ENTERTAINMENT: 'ENTERTAINMENT',
      MUSIC: 'MUSIC',
      VIDEO: 'VIDEO',
      SOFTWARE: 'SOFTWARE',
      GAMING: 'GAMING',
      EDUCATION: 'EDUCATION',
      HEALTH: 'HEALTH',
      FITNESS: 'FITNESS',
      NEWS: 'NEWS',
      CLOUD: 'CLOUD',
      STORAGE: 'STORAGE',
      PRODUCTIVITY: 'PRODUCTIVITY',
      FINANCE: 'FINANCE',
      SHOPPING: 'SHOPPING',
      FOOD: 'FOOD',
      TRANSPORTATION: 'TRANSPORTATION',
      UTILITIES: 'UTILITIES',
      INSURANCE: 'INSURANCE',
      COMMUNICATION: 'COMMUNICATION',
      OTHER: 'OTHER',
    },
  }
})

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})
