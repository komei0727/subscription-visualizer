import { prisma } from '../utils/test-db'
import { createTestUser } from '../utils/test-factories'
import { subscriptionSchema } from '@/lib/validations/subscription'
import { BillingCycle, Category } from '@prisma/client'

describe('Validation Service Integration Tests', () => {
  let testUser: any
  let testUserId: string

  beforeEach(async () => {
    const userData = await createTestUser()
    testUser = await prisma.user.create({ data: userData })
    testUserId = testUser.id
  })

  describe('Subscription Schema Validation', () => {
    it('validates required fields', () => {
      const invalidData = {
        name: '', // Empty string to trigger the min length validation
        // Missing other required fields
      }

      const result = subscriptionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        // Check name validation
        const nameError = result.error.issues.find(issue => issue.path[0] === 'name')
        expect(nameError).toBeDefined()
        expect(nameError?.message).toBe('名前は必須です')
        
        // Check other required fields
        const amountError = result.error.issues.find(issue => issue.path[0] === 'amount')
        expect(amountError).toBeDefined()
        
        const billingCycleError = result.error.issues.find(issue => issue.path[0] === 'billingCycle')
        expect(billingCycleError).toBeDefined()
      }
    })

    it('validates amount is positive', () => {
      const invalidData = {
        name: 'Test Service',
        amount: -1000,
        currency: 'JPY',
        billingCycle: BillingCycle.MONTHLY,
        category: Category.OTHER,
        nextBillingDate: new Date(),
      }

      const result = subscriptionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['amount'],
            message: '金額は正の数値を入力してください',
          })
        )
      }
    })

    it('validates name length', () => {
      const invalidData = {
        name: 'a'.repeat(101), // Exceeds 100 character limit
        amount: 1000,
        currency: 'JPY',
        billingCycle: BillingCycle.MONTHLY,
        category: Category.OTHER,
        nextBillingDate: new Date(),
      }

      const result = subscriptionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['name'],
            message: '名前は100文字以内で入力してください',
          })
        )
      }
    })

    it('validates enum values', () => {
      const invalidData = {
        name: 'Test Service',
        amount: 1000,
        currency: 'JPY',
        billingCycle: 'INVALID_CYCLE' as any,
        category: Category.OTHER,
        nextBillingDate: new Date(),
      }

      const result = subscriptionSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('accepts valid subscription data', () => {
      const validData = {
        name: 'Netflix',
        amount: 1490,
        currency: 'JPY',
        billingCycle: BillingCycle.MONTHLY,
        category: Category.VIDEO,
        nextBillingDate: new Date(),
        description: 'Premium plan',
        url: 'https://netflix.com',
        notes: 'Family account',
      }

      const result = subscriptionSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Database Validation Integration', () => {
    it('database rejects invalid data that passes schema validation', async () => {
      // This tests database-level constraints
      await expect(
        prisma.subscription.create({
          data: {
            userId: 'invalid-user-id', // Non-existent user
            name: 'Test Service',
            amount: 1000,
            currency: 'JPY',
            billingCycle: BillingCycle.MONTHLY,
            category: Category.OTHER,
            nextBillingDate: new Date(),
            isActive: true,
            autoRenew: true,
          },
        })
      ).rejects.toThrow()
    })

    it('handles decimal precision correctly', async () => {
      const subscription = await prisma.subscription.create({
        data: {
          userId: testUserId,
          name: 'Precision Test',
          amount: 1234.56,
          currency: 'USD',
          billingCycle: BillingCycle.MONTHLY,
          category: Category.OTHER,
          nextBillingDate: new Date(),
          isActive: true,
          autoRenew: true,
        },
      })

      expect(subscription.amount.toString()).toBe('1234.56')
    })
  })
})