import { prisma } from '../utils/test-db'
import { createTestUser, createTestSubscription } from '../utils/test-factories'
import { BillingCycle, Category } from '@prisma/client'
import { addDays, subDays } from 'date-fns'

describe('Subscription Service Integration Tests', () => {
  let testUser: any
  let testUserId: string

  beforeEach(async () => {
    const userData = await createTestUser()
    testUser = await prisma.user.create({ data: userData })
    testUserId = testUser.id
  })

  describe('Subscription Analytics', () => {
    beforeEach(async () => {
      // Create diverse test data
      await Promise.all([
        // Active subscriptions
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Netflix',
            amount: 1490,
            billingCycle: BillingCycle.MONTHLY,
            category: Category.VIDEO,
            isActive: true,
          }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Spotify',
            amount: 980,
            billingCycle: BillingCycle.MONTHLY,
            category: Category.MUSIC,
            isActive: true,
          }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Adobe Creative Cloud',
            amount: 72336,
            billingCycle: BillingCycle.YEARLY,
            category: Category.SOFTWARE,
            isActive: true,
          }),
        }),
        // Cancelled subscription
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Disney+',
            amount: 990,
            billingCycle: BillingCycle.MONTHLY,
            category: Category.VIDEO,
            isActive: false,
            cancelledAt: subDays(new Date(), 30),
          }),
        }),
      ])
    })

    it('calculates monthly spending correctly', async () => {
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          userId: testUserId,
          isActive: true,
        },
      })

      // Calculate monthly amount
      const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
        let monthlyAmount = Number(sub.amount)
        
        switch (sub.billingCycle) {
          case BillingCycle.YEARLY:
            monthlyAmount = monthlyAmount / 12
            break
          case BillingCycle.QUARTERLY:
            monthlyAmount = monthlyAmount / 3
            break
          case BillingCycle.SEMI_ANNUAL:
            monthlyAmount = monthlyAmount / 6
            break
          case BillingCycle.WEEKLY:
            monthlyAmount = monthlyAmount * 4.33 // Average weeks per month
            break
          case BillingCycle.DAILY:
            monthlyAmount = monthlyAmount * 30
            break
        }
        
        return total + monthlyAmount
      }, 0)

      // Netflix: 1490 + Spotify: 980 + Adobe: 72336/12 = 8498
      expect(Math.round(monthlyTotal)).toBe(8498)
    })

    it('groups subscriptions by category', async () => {
      const result = await prisma.subscription.groupBy({
        by: ['category'],
        where: {
          userId: testUserId,
          isActive: true,
        },
        _count: {
          category: true,
        },
        _sum: {
          amount: true,
        },
      })

      const categoryMap = new Map(
        result.map(r => [r.category, { count: r._count.category, total: r._sum.amount }])
      )

      expect(categoryMap.get(Category.VIDEO)?.count).toBe(1)
      expect(categoryMap.get(Category.VIDEO)?.total?.toString()).toBe('1490')
      expect(categoryMap.get(Category.MUSIC)?.count).toBe(1)
      expect(categoryMap.get(Category.MUSIC)?.total?.toString()).toBe('980')
      expect(categoryMap.get(Category.SOFTWARE)?.count).toBe(1)
      expect(categoryMap.get(Category.SOFTWARE)?.total?.toString()).toBe('72336')
    })
  })

  describe('Upcoming Payments', () => {
    it('finds subscriptions due within next 7 days', async () => {
      // Create subscriptions with different due dates
      await Promise.all([
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Due Tomorrow',
            nextBillingDate: addDays(new Date(), 1),
            isActive: true,
          }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Due in 5 Days',
            nextBillingDate: addDays(new Date(), 5),
            isActive: true,
          }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Due in 10 Days',
            nextBillingDate: addDays(new Date(), 10),
            isActive: true,
          }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Overdue',
            nextBillingDate: subDays(new Date(), 2),
            isActive: true,
          }),
        }),
      ])

      const sevenDaysFromNow = addDays(new Date(), 7)
      const upcomingSubscriptions = await prisma.subscription.findMany({
        where: {
          userId: testUserId,
          isActive: true,
          nextBillingDate: {
            gte: new Date(),
            lte: sevenDaysFromNow,
          },
        },
        orderBy: {
          nextBillingDate: 'asc',
        },
      })

      expect(upcomingSubscriptions).toHaveLength(2)
      expect(upcomingSubscriptions[0].name).toBe('Due Tomorrow')
      expect(upcomingSubscriptions[1].name).toBe('Due in 5 Days')
    })

    it('identifies overdue subscriptions', async () => {
      await Promise.all([
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Overdue 1 Day',
            nextBillingDate: subDays(new Date(), 1),
            isActive: true,
          }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Overdue 1 Week',
            nextBillingDate: subDays(new Date(), 7),
            isActive: true,
          }),
        }),
        prisma.subscription.create({
          data: createTestSubscription(testUserId, {
            name: 'Not Overdue',
            nextBillingDate: addDays(new Date(), 1),
            isActive: true,
          }),
        }),
      ])

      const overdueSubscriptions = await prisma.subscription.findMany({
        where: {
          userId: testUserId,
          isActive: true,
          nextBillingDate: {
            lt: new Date(),
          },
        },
        orderBy: {
          nextBillingDate: 'asc',
        },
      })

      expect(overdueSubscriptions).toHaveLength(2)
      expect(overdueSubscriptions[0].name).toBe('Overdue 1 Week')
      expect(overdueSubscriptions[1].name).toBe('Overdue 1 Day')
    })
  })

  describe('Subscription History', () => {
    it('tracks subscription lifecycle', async () => {
      // Create subscription
      const subscription = await prisma.subscription.create({
        data: createTestSubscription(testUserId, {
          name: 'Service with History',
          isActive: true,
        }),
      })

      // Cancel subscription
      const cancelledSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          isActive: false,
          cancelledAt: new Date(),
        },
      })

      expect(cancelledSubscription.isActive).toBe(false)
      expect(cancelledSubscription.cancelledAt).toBeDefined()

      // Reactivate subscription
      const reactivatedSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          isActive: true,
          cancelledAt: null,
        },
      })

      expect(reactivatedSubscription.isActive).toBe(true)
      expect(reactivatedSubscription.cancelledAt).toBeNull()
    })
  })

  describe('Payment Records', () => {
    it('creates payment records for subscriptions', async () => {
      const subscription = await prisma.subscription.create({
        data: createTestSubscription(testUserId, {
          name: 'Paid Service',
          amount: 2000,
        }),
      })

      // Create payment records
      const payments = await Promise.all([
        prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: subscription.amount,
            currency: subscription.currency,
            paidAt: subDays(new Date(), 30),
            status: 'COMPLETED',
          },
        }),
        prisma.payment.create({
          data: {
            subscriptionId: subscription.id,
            amount: subscription.amount,
            currency: subscription.currency,
            paidAt: new Date(),
            status: 'COMPLETED',
          },
        }),
      ])

      // Get subscription with payment history
      const subscriptionWithPayments = await prisma.subscription.findUnique({
        where: { id: subscription.id },
        include: {
          payments: {
            orderBy: { paidAt: 'desc' },
          },
        },
      })

      expect(subscriptionWithPayments?.payments).toHaveLength(2)
      expect(subscriptionWithPayments?.payments[0].status).toBe('COMPLETED')
    })

    it('calculates total spent on subscription', async () => {
      const subscription = await prisma.subscription.create({
        data: createTestSubscription(testUserId, {
          amount: 1500,
        }),
      })

      // Create multiple payments
      await Promise.all(
        Array.from({ length: 6 }, (_, i) => 
          prisma.payment.create({
            data: {
              subscriptionId: subscription.id,
              amount: subscription.amount,
              currency: subscription.currency,
              paidAt: subDays(new Date(), i * 30),
              status: 'COMPLETED',
            },
          })
        )
      )

      // Calculate total spent
      const totalSpent = await prisma.payment.aggregate({
        where: {
          subscriptionId: subscription.id,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      })

      expect(totalSpent._sum.amount?.toString()).toBe('9000') // 1500 * 6
    })
  })
})