import { GET, POST } from '@/app/api/subscriptions/route'
import { auth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

jest.mock('@/lib/auth-helpers')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe('/api/subscriptions', () => {
  const mockAuth = auth as jest.MockedFunction<typeof auth>
  const mockPrisma = prisma as jest.Mocked<typeof prisma>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/subscriptions', () => {
    it('returns 401 when not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns subscriptions for authenticated user', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any)

      const mockSubscriptions = [
        { id: '1', name: 'Netflix', amount: 1000 },
        { id: '2', name: 'Spotify', amount: 500 },
      ]

      mockPrisma.subscription.findMany.mockResolvedValueOnce(mockSubscriptions as any)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockSubscriptions)
      expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { nextBillingDate: 'asc' },
      })
    })

    it('handles database errors', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any)

      mockPrisma.subscription.findMany.mockRejectedValueOnce(new Error('Database error'))

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch subscriptions')
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('POST /api/subscriptions', () => {
    it('returns 401 when not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('creates subscription with valid data', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any)

      const subscriptionData = {
        name: 'Netflix',
        amount: 1000,
        billingCycle: 'MONTHLY',
        category: 'ENTERTAINMENT',
        nextBillingDate: '2024-01-15T00:00:00Z',
      }

      const createdSubscription = {
        id: 'sub-123',
        ...subscriptionData,
        userId: 'user-123',
      }

      mockPrisma.subscription.create.mockResolvedValueOnce(createdSubscription as any)

      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify(subscriptionData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(createdSubscription)
      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
        data: {
          ...subscriptionData,
          userId: 'user-123',
          amount: 1000,
        },
      })
    })

    it('returns 400 for invalid data', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any)

      const invalidData = {
        // Missing required fields
        amount: 'invalid', // Should be number
      }

      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('handles database creation errors', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'user-123', email: 'test@example.com' },
      } as any)

      const subscriptionData = {
        name: 'Netflix',
        amount: 1000,
        billingCycle: 'MONTHLY',
        category: 'ENTERTAINMENT',
        nextBillingDate: '2024-01-15T00:00:00Z',
      }

      mockPrisma.subscription.create.mockRejectedValueOnce(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify(subscriptionData),
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create subscription')
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })
})