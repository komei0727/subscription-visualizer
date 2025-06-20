import { prisma } from '../utils/test-db'
import { createTestUser, createTestSubscription } from '../utils/test-factories'
import { BillingCycle, Category } from '@prisma/client'

describe('Subscription Database Operations', () => {
  let testUser: any
  let testUserId: string

  beforeEach(async () => {
    const userData = await createTestUser()
    testUser = await prisma.user.create({ data: userData })
    testUserId = testUser.id
  })

  describe('CRUD Operations', () => {
    it('creates a subscription successfully', async () => {
      const subscriptionData = createTestSubscription(testUserId, {
        name: 'Netflix',
        amount: 1490,
        currency: 'JPY',
        billingCycle: BillingCycle.MONTHLY,
        category: Category.VIDEO,
      })

      const subscription = await prisma.subscription.create({
        data: subscriptionData,
      })

      expect(subscription).toBeDefined()
      expect(subscription.id).toBeTruthy()
      expect(subscription.name).toBe('Netflix')
      expect(subscription.amount.toString()).toBe('1490')
      expect(subscription.userId).toBe(testUserId)
    })

    it('reads subscriptions for a specific user', async () => {
      // Create multiple subscriptions
      const subscriptions = await Promise.all([
        prisma.subscription.create({
          data: createTestSubscription(testUserId, { name: 'Service 1' }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, { name: 'Service 2' }),
        }),
      ])

      // Create subscription for another user
      const otherUser = await prisma.user.create({
        data: await createTestUser({ email: 'other@example.com' }),
      })
      await prisma.subscription.create({
        data: createTestSubscription(otherUser.id, { name: 'Other Service' }),
      })

      // Read subscriptions for test user
      const userSubscriptions = await prisma.subscription.findMany({
        where: { userId: testUserId },
        orderBy: { createdAt: 'desc' },
      })

      expect(userSubscriptions).toHaveLength(2)
      expect(userSubscriptions.map((s) => s.name).sort()).toEqual([
        'Service 1',
        'Service 2',
      ])
    })

    it('updates a subscription', async () => {
      const subscription = await prisma.subscription.create({
        data: createTestSubscription(testUserId, {
          name: 'Original Name',
          amount: 1000,
        }),
      })

      const updated = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          name: 'Updated Name',
          amount: 2000,
        },
      })

      expect(updated.name).toBe('Updated Name')
      expect(updated.amount.toString()).toBe('2000')
    })

    it('deletes a subscription', async () => {
      const subscription = await prisma.subscription.create({
        data: createTestSubscription(testUserId),
      })

      await prisma.subscription.delete({
        where: { id: subscription.id },
      })

      const found = await prisma.subscription.findUnique({
        where: { id: subscription.id },
      })

      expect(found).toBeNull()
    })
  })

  describe('Data Validation', () => {
    it('enforces required fields', async () => {
      await expect(
        prisma.subscription.create({
          data: {
            userId: testUserId,
            // Missing required fields
          } as any,
        })
      ).rejects.toThrow()
    })

    it('enforces valid enum values', async () => {
      await expect(
        prisma.subscription.create({
          data: {
            ...createTestSubscription(testUserId),
            billingCycle: 'INVALID' as any,
          },
        })
      ).rejects.toThrow()
    })
  })

  describe('Relationships', () => {
    it('creates subscription with user relationship', async () => {
      const subscription = await prisma.subscription.create({
        data: createTestSubscription(testUserId),
        include: {
          user: true,
        },
      })

      expect(subscription.user).toBeDefined()
      expect(subscription.user.id).toBe(testUserId)
      expect(subscription.user.email).toBe(testUser.email)
    })

    it('cascades delete when user is deleted', async () => {
      // Create subscriptions
      await Promise.all([
        prisma.subscription.create({
          data: createTestSubscription(testUserId, { name: 'Sub 1' }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, { name: 'Sub 2' }),
        }),
      ])

      // Delete user
      await prisma.user.delete({
        where: { id: testUserId },
      })

      // Check subscriptions are deleted
      const subscriptions = await prisma.subscription.findMany({
        where: { userId: testUserId },
      })

      expect(subscriptions).toHaveLength(0)
    })
  })

  describe('Queries and Filters', () => {
    beforeEach(async () => {
      // Create test data
      await Promise.all([
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Active Monthly',
            billingCycle: BillingCycle.MONTHLY,
            isActive: true,
            amount: 1000,
          }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Active Yearly',
            billingCycle: BillingCycle.YEARLY,
            isActive: true,
            amount: 12000,
          }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Cancelled Monthly',
            billingCycle: BillingCycle.MONTHLY,
            isActive: false,
            amount: 500,
          }),
        }),
      ])
    })

    it('filters by active status', async () => {
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          userId: testUserId,
          isActive: true,
        },
      })

      expect(activeSubscriptions).toHaveLength(2)
      expect(activeSubscriptions.every((s) => s.isActive)).toBe(true)
    })

    it('filters by billing cycle', async () => {
      const monthlySubscriptions = await prisma.subscription.findMany({
        where: {
          userId: testUserId,
          billingCycle: BillingCycle.MONTHLY,
        },
      })

      expect(monthlySubscriptions).toHaveLength(2)
      expect(
        monthlySubscriptions.every(
          (s) => s.billingCycle === BillingCycle.MONTHLY
        )
      ).toBe(true)
    })

    it('calculates total amount for active subscriptions', async () => {
      const result = await prisma.subscription.aggregate({
        where: {
          userId: testUserId,
          isActive: true,
        },
        _sum: {
          amount: true,
        },
      })

      expect(result._sum.amount?.toString()).toBe('13000')
    })
  })
})
