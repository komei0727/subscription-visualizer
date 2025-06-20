import { BillingCycle, Category, User, Subscription } from '@prisma/client'
import { hash } from 'bcryptjs'
import { addDays } from 'date-fns'

export async function createTestUser(overrides?: Partial<User>) {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    hashedPassword: await hash('password123', 10),
    emailVerified: new Date(),
    ...overrides,
  }
  return defaultUser
}

export function createTestSubscription(
  userId: string,
  overrides?: Partial<Subscription>
) {
  const defaultSubscription = {
    userId,
    name: 'Test Subscription',
    amount: 1000,
    currency: 'JPY',
    billingCycle: BillingCycle.MONTHLY,
    category: Category.ENTERTAINMENT,
    nextBillingDate: addDays(new Date(), 30),
    isActive: true,
    autoRenew: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
  return defaultSubscription
}

export function createMultipleTestSubscriptions(userId: string, count: number) {
  const categories = Object.values(Category)
  const billingCycles = Object.values(BillingCycle)

  return Array.from({ length: count }, (_, index) => ({
    userId,
    name: `Subscription ${index + 1}`,
    amount: (index + 1) * 1000,
    currency: 'JPY',
    billingCycle: billingCycles[index % billingCycles.length],
    category: categories[index % categories.length],
    nextBillingDate: addDays(new Date(), (index + 1) * 5),
    isActive: index % 3 !== 0, // Every 3rd subscription is inactive
    autoRenew: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
}
