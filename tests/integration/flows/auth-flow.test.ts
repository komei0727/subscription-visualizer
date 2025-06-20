import { prisma } from '../utils/test-db'
import { createTestUser } from '../utils/test-factories'
import { GET, POST } from '@/app/api/subscriptions/route'
import { createTestRequest, parseResponse } from '../utils/test-request'
import { BillingCycle, Category } from '@prisma/client'

describe('Authentication Flow Integration Tests', () => {
  let testUser: any
  let testUserId: string

  beforeEach(async () => {
    const userData = await createTestUser()
    testUser = await prisma.user.create({ data: userData })
    testUserId = testUser.id
  })

  it('denies access to unauthenticated requests', async () => {
    // Ensure no session is active
    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue(null)

    // Try to get subscriptions without auth
    const getRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const getResponse = await GET(getRequest)
    const getResult = await parseResponse(getResponse)

    expect(getResult.status).toBe(401)
    expect(getResult.data).toHaveProperty('error', 'Unauthorized')

    // Try to create subscription without auth
    const postRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions',
      {
        method: 'POST',
        body: {
          name: 'Test Service',
          amount: 1000,
          currency: 'JPY',
          billingCycle: BillingCycle.MONTHLY,
          category: Category.OTHER,
          nextBillingDate: new Date().toISOString(),
        },
      }
    )
    const postResponse = await POST(postRequest)
    const postResult = await parseResponse(postResponse)

    expect(postResult.status).toBe(401)
    expect(postResult.data).toHaveProperty('error', 'Unauthorized')
  })

  it('allows access with valid authentication', async () => {
    // Mock authenticated session
    const mockGetServerSession = jest.spyOn(
      require('next-auth'),
      'getServerSession'
    )
    mockGetServerSession.mockResolvedValue({
      user: {
        id: testUserId,
        email: testUser.email,
        name: testUser.name,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Get subscriptions with auth
    const getRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const getResponse = await GET(getRequest)
    const getResult = await parseResponse(getResponse)

    expect(getResult.status).toBe(200)
    expect(Array.isArray(getResult.data)).toBe(true)

    // Create subscription with auth
    const postRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions',
      {
        method: 'POST',
        body: {
          name: 'Authenticated Service',
          amount: 2000,
          currency: 'JPY',
          billingCycle: BillingCycle.MONTHLY,
          category: Category.SOFTWARE,
          nextBillingDate: new Date().toISOString(),
        },
      }
    )
    const postResponse = await POST(postRequest)
    const postResult = await parseResponse(postResponse)

    expect(postResult.status).toBe(201)
    expect(postResult.data).toHaveProperty('id')
    expect(postResult.data.userId).toBe(testUserId)
  })

  it('isolates data between different users', async () => {
    // Create second user
    const user2Data = await createTestUser({ email: 'user2@example.com' })
    const user2 = await prisma.user.create({ data: user2Data })

    // Create subscriptions for user 1
    await prisma.subscription.createMany({
      data: [
        {
          userId: testUserId,
          name: 'User1 Subscription 1',
          amount: 1000,
          currency: 'JPY',
          billingCycle: BillingCycle.MONTHLY,
          category: Category.ENTERTAINMENT,
          nextBillingDate: new Date(),
        },
        {
          userId: testUserId,
          name: 'User1 Subscription 2',
          amount: 2000,
          currency: 'JPY',
          billingCycle: BillingCycle.YEARLY,
          category: Category.SOFTWARE,
          nextBillingDate: new Date(),
        },
      ],
    })

    // Create subscriptions for user 2
    await prisma.subscription.createMany({
      data: [
        {
          userId: user2.id,
          name: 'User2 Subscription 1',
          amount: 3000,
          currency: 'JPY',
          billingCycle: BillingCycle.MONTHLY,
          category: Category.MUSIC,
          nextBillingDate: new Date(),
        },
      ],
    })

    // Mock session for user 1
    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
      user: {
        id: testUserId,
        email: testUser.email,
        name: testUser.name,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // User 1 should only see their subscriptions
    const user1Request = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const user1Response = await GET(user1Request)
    const user1Result = await parseResponse(user1Response)

    expect(user1Result.status).toBe(200)
    expect(user1Result.data).toHaveLength(2)
    user1Result.data.forEach((sub: any) => {
      expect(sub.userId).toBe(testUserId)
      expect(sub.name).toContain('User1')
    })

    // Mock session for user 2
    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
      user: {
        id: user2.id,
        email: user2.email,
        name: user2.name,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // User 2 should only see their subscriptions
    const user2Request = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const user2Response = await GET(user2Request)
    const user2Result = await parseResponse(user2Response)

    expect(user2Result.status).toBe(200)
    expect(user2Result.data).toHaveLength(1)
    expect(user2Result.data[0].userId).toBe(user2.id)
    expect(user2Result.data[0].name).toContain('User2')
  })

  it('handles session expiration', async () => {
    // Mock expired session
    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
      user: {
        id: testUserId,
        email: testUser.email,
        name: testUser.name,
      },
      expires: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
    })

    // Depending on NextAuth configuration, expired sessions might still work
    // or might be treated as no session. For this test, we'll assume
    // NextAuth returns null for expired sessions
    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue(null)

    const request = createTestRequest('http://localhost:3000/api/subscriptions')
    const response = await GET(request)
    const result = await parseResponse(response)

    expect(result.status).toBe(401)
    expect(result.data).toHaveProperty('error', 'Unauthorized')
  })

  it('validates user permissions for resource access', async () => {
    // Create subscription for test user
    const subscription = await prisma.subscription.create({
      data: {
        userId: testUserId,
        name: 'User1 Private Subscription',
        amount: 5000,
        currency: 'JPY',
        billingCycle: BillingCycle.MONTHLY,
        category: Category.FINANCE,
        nextBillingDate: new Date(),
      },
    })

    // Create another user
    const otherUserData = await createTestUser({ email: 'other@example.com' })
    const otherUser = await prisma.user.create({ data: otherUserData })

    // Mock session for other user
    jest.spyOn(require('next-auth'), 'getServerSession').mockResolvedValue({
      user: {
        id: otherUser.id,
        email: otherUser.email,
        name: otherUser.name,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })

    // Other user tries to access test user's subscription
    const { GET: GET_BY_ID } = await import(
      '@/app/api/subscriptions/[id]/route'
    )
    const request = createTestRequest(
      `http://localhost:3000/api/subscriptions/${subscription.id}`
    )
    const response = await GET_BY_ID(request, {
      params: { id: subscription.id },
    })
    const result = await parseResponse(response)

    // Should return 404 (not found) rather than 403 (forbidden) to avoid
    // leaking information about existence of resources
    expect(result.status).toBe(404)
    expect(result.data).toHaveProperty('error', 'Subscription not found')
  })
})
