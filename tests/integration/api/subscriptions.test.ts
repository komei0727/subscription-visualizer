import { GET, POST, PUT, DELETE } from '@/app/api/subscriptions/route'
import {
  GET as GET_BY_ID,
  PUT as PUT_BY_ID,
  DELETE as DELETE_BY_ID,
} from '@/app/api/subscriptions/[id]/route'
import { prisma } from '../utils/test-db'
import {
  createTestUser,
  createTestSubscription,
  createMultipleTestSubscriptions,
} from '../utils/test-factories'
import {
  mockSession,
  createTestRequest,
  parseResponse,
} from '../utils/test-request'
import { BillingCycle, Category } from '@prisma/client'

describe('Subscriptions API Integration Tests', () => {
  let testUser: any
  let testUserId: string

  beforeEach(async () => {
    // Create test user
    const userData = await createTestUser()
    testUser = await prisma.user.create({ data: userData })
    testUserId = testUser.id

    // Mock authenticated session
    mockSession(testUserId, testUser.email)
  })

  describe('GET /api/subscriptions', () => {
    it('returns empty array when user has no subscriptions', async () => {
      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions'
      )
      const response = await GET(request)
      const result = await parseResponse(response)

      expect(result.status).toBe(200)
      expect(result.data).toEqual([])
    })

    it('returns all user subscriptions', async () => {
      // Create test subscriptions
      const subscriptionsData = createMultipleTestSubscriptions(testUserId, 5)
      await prisma.subscription.createMany({ data: subscriptionsData })

      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions'
      )
      const response = await GET(request)
      const result = await parseResponse(response)

      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(5)
      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('name')
      expect(result.data[0]).toHaveProperty('amount')
    })

    it('returns 401 when not authenticated', async () => {
      // Clear session mock
      jest
        .spyOn(require('next-auth'), 'getServerSession')
        .mockResolvedValueOnce(null)

      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions'
      )
      const response = await GET(request)
      const result = await parseResponse(response)

      expect(result.status).toBe(401)
      expect(result.data).toHaveProperty('error', 'Unauthorized')
    })

    it('only returns subscriptions for authenticated user', async () => {
      // Create another user with subscriptions
      const otherUserData = await createTestUser({ email: 'other@example.com' })
      const otherUser = await prisma.user.create({ data: otherUserData })

      // Create subscriptions for both users
      await prisma.subscription.createMany({
        data: [
          ...createMultipleTestSubscriptions(testUserId, 3),
          ...createMultipleTestSubscriptions(otherUser.id, 2),
        ],
      })

      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions'
      )
      const response = await GET(request)
      const result = await parseResponse(response)

      expect(result.status).toBe(200)
      expect(result.data).toHaveLength(3) // Only test user's subscriptions
      result.data.forEach((sub: any) => {
        expect(sub.userId).toBe(testUserId)
      })
    })
  })

  describe('POST /api/subscriptions', () => {
    it('creates a new subscription with valid data', async () => {
      const subscriptionData = {
        name: 'Netflix',
        amount: 1980,
        currency: 'JPY',
        billingCycle: BillingCycle.MONTHLY,
        category: Category.ENTERTAINMENT,
        nextBillingDate: new Date().toISOString(),
        notes: 'Premium plan',
      }

      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions',
        {
          method: 'POST',
          body: subscriptionData,
        }
      )
      const response = await POST(request)
      const result = await parseResponse(response)

      expect(result.status).toBe(201)
      expect(result.data).toHaveProperty('id')
      expect(result.data.name).toBe('Netflix')
      expect(result.data.amount).toBe('1980') // Prisma returns Decimal as string
      expect(result.data.userId).toBe(testUserId)

      // Verify in database
      const subscription = await prisma.subscription.findUnique({
        where: { id: result.data.id },
      })
      expect(subscription).toBeTruthy()
      expect(subscription?.name).toBe('Netflix')
    })

    it('validates required fields', async () => {
      const invalidData = {
        // Missing required fields
        amount: 1000,
      }

      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions',
        {
          method: 'POST',
          body: invalidData,
        }
      )
      const response = await POST(request)
      const result = await parseResponse(response)

      expect(result.status).toBe(400)
      expect(result.data).toHaveProperty('error')
    })

    it('validates amount is positive', async () => {
      const invalidData = {
        name: 'Test',
        amount: -100,
        currency: 'JPY',
        billingCycle: BillingCycle.MONTHLY,
        category: Category.OTHER,
        nextBillingDate: new Date().toISOString(),
      }

      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions',
        {
          method: 'POST',
          body: invalidData,
        }
      )
      const response = await POST(request)
      const result = await parseResponse(response)

      expect(result.status).toBe(400)
      expect(result.data.error).toContain('金額は正の数値を入力してください')
    })

    it('returns 401 when not authenticated', async () => {
      jest
        .spyOn(require('next-auth'), 'getServerSession')
        .mockResolvedValueOnce(null)

      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions',
        {
          method: 'POST',
          body: { name: 'Test' },
        }
      )
      const response = await POST(request)
      const result = await parseResponse(response)

      expect(result.status).toBe(401)
      expect(result.data).toHaveProperty('error', 'Unauthorized')
    })
  })

  describe('GET /api/subscriptions/[id]', () => {
    it('returns subscription by id', async () => {
      const subscriptionData = createTestSubscription(testUserId)
      const subscription = await prisma.subscription.create({
        data: subscriptionData,
      })

      const request = createTestRequest(
        `http://localhost:3000/api/subscriptions/${subscription.id}`
      )
      const response = await GET_BY_ID(request, {
        params: { id: subscription.id },
      })
      const result = await parseResponse(response)

      expect(result.status).toBe(200)
      expect(result.data.id).toBe(subscription.id)
      expect(result.data.name).toBe(subscription.name)
    })

    it('returns 404 for non-existent subscription', async () => {
      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions/non-existent-id'
      )
      const response = await GET_BY_ID(request, {
        params: { id: 'non-existent-id' },
      })
      const result = await parseResponse(response)

      expect(result.status).toBe(404)
      expect(result.data).toHaveProperty('error', 'Subscription not found')
    })

    it('returns 404 when trying to access other user subscription', async () => {
      // Create subscription for another user
      const otherUserData = await createTestUser({ email: 'other@example.com' })
      const otherUser = await prisma.user.create({ data: otherUserData })
      const otherSubscription = await prisma.subscription.create({
        data: createTestSubscription(otherUser.id),
      })

      const request = createTestRequest(
        `http://localhost:3000/api/subscriptions/${otherSubscription.id}`
      )
      const response = await GET_BY_ID(request, {
        params: { id: otherSubscription.id },
      })
      const result = await parseResponse(response)

      expect(result.status).toBe(404)
      expect(result.data).toHaveProperty('error', 'Subscription not found')
    })
  })

  describe('PUT /api/subscriptions/[id]', () => {
    it('updates subscription successfully', async () => {
      const subscription = await prisma.subscription.create({
        data: createTestSubscription(testUserId, {
          name: 'Old Name',
          amount: 1000,
        }),
      })

      const updateData = {
        name: 'Updated Name',
        amount: 2000,
      }

      const request = createTestRequest(
        `http://localhost:3000/api/subscriptions/${subscription.id}`,
        {
          method: 'PUT',
          body: updateData,
        }
      )
      const response = await PUT_BY_ID(request, {
        params: { id: subscription.id },
      })
      const result = await parseResponse(response)

      expect(result.status).toBe(200)
      expect(result.data.name).toBe('Updated Name')
      expect(result.data.amount).toBe('2000')

      // Verify in database
      const updated = await prisma.subscription.findUnique({
        where: { id: subscription.id },
      })
      expect(updated?.name).toBe('Updated Name')
      expect(Number(updated?.amount)).toBe(2000)
    })

    it('validates update data', async () => {
      const subscription = await prisma.subscription.create({
        data: createTestSubscription(testUserId),
      })

      const invalidUpdate = {
        amount: -100, // Invalid negative amount
      }

      const request = createTestRequest(
        `http://localhost:3000/api/subscriptions/${subscription.id}`,
        {
          method: 'PUT',
          body: invalidUpdate,
        }
      )
      const response = await PUT_BY_ID(request, {
        params: { id: subscription.id },
      })
      const result = await parseResponse(response)

      expect(result.status).toBe(400)
      expect(result.data.error).toContain('金額は正の数値を入力してください')
    })

    it('returns 404 when updating non-existent subscription', async () => {
      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions/non-existent-id',
        {
          method: 'PUT',
          body: { name: 'Updated' },
        }
      )
      const response = await PUT_BY_ID(request, {
        params: { id: 'non-existent-id' },
      })
      const result = await parseResponse(response)

      expect(result.status).toBe(404)
      expect(result.data).toHaveProperty('error', 'Subscription not found')
    })
  })

  describe('DELETE /api/subscriptions/[id]', () => {
    it('deletes subscription successfully', async () => {
      const subscription = await prisma.subscription.create({
        data: createTestSubscription(testUserId),
      })

      const request = createTestRequest(
        `http://localhost:3000/api/subscriptions/${subscription.id}`,
        {
          method: 'DELETE',
        }
      )
      const response = await DELETE_BY_ID(request, {
        params: { id: subscription.id },
      })
      const result = await parseResponse(response)

      expect(result.status).toBe(200)
      expect(result.data).toHaveProperty(
        'message',
        'Subscription deleted successfully'
      )

      // Verify deletion in database
      const deleted = await prisma.subscription.findUnique({
        where: { id: subscription.id },
      })
      expect(deleted).toBeNull()
    })

    it('returns 404 when deleting non-existent subscription', async () => {
      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions/non-existent-id',
        {
          method: 'DELETE',
        }
      )
      const response = await DELETE_BY_ID(request, {
        params: { id: 'non-existent-id' },
      })
      const result = await parseResponse(response)

      expect(result.status).toBe(404)
      expect(result.data).toHaveProperty('error', 'Subscription not found')
    })

    it('cannot delete other user subscription', async () => {
      // Create subscription for another user
      const otherUserData = await createTestUser({ email: 'other@example.com' })
      const otherUser = await prisma.user.create({ data: otherUserData })
      const otherSubscription = await prisma.subscription.create({
        data: createTestSubscription(otherUser.id),
      })

      const request = createTestRequest(
        `http://localhost:3000/api/subscriptions/${otherSubscription.id}`,
        {
          method: 'DELETE',
        }
      )
      const response = await DELETE_BY_ID(request, {
        params: { id: otherSubscription.id },
      })
      const result = await parseResponse(response)

      expect(result.status).toBe(404)
      expect(result.data).toHaveProperty('error', 'Subscription not found')

      // Verify subscription still exists
      const exists = await prisma.subscription.findUnique({
        where: { id: otherSubscription.id },
      })
      expect(exists).toBeTruthy()
    })
  })
})
