import { prisma } from '../utils/test-db'
import { createTestUser, createTestSubscription } from '../utils/test-factories'
import {
  mockSession,
  createTestRequest,
  parseResponse,
} from '../utils/test-request'
import { GET, POST } from '@/app/api/subscriptions/route'
import {
  PUT as PUT_BY_ID,
  DELETE as DELETE_BY_ID,
} from '@/app/api/subscriptions/[id]/route'
import { BillingCycle, Category } from '@prisma/client'
import { addDays, subDays } from 'date-fns'

describe('Subscription Lifecycle Flow', () => {
  let testUser: any
  let testUserId: string

  beforeEach(async () => {
    const userData = await createTestUser()
    testUser = await prisma.user.create({ data: userData })
    testUserId = testUser.id
    mockSession(testUserId, testUser.email)
  })

  it('completes full subscription lifecycle: create, read, update, delete', async () => {
    // Step 1: Create subscription
    const createData = {
      name: 'Spotify',
      amount: 980,
      currency: 'JPY',
      billingCycle: BillingCycle.MONTHLY,
      category: Category.MUSIC,
      nextBillingDate: addDays(new Date(), 30).toISOString(),
      notes: 'Family plan',
    }

    const createRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions',
      {
        method: 'POST',
        body: createData,
      }
    )
    const createResponse = await POST(createRequest)
    const createResult = await parseResponse(createResponse)

    expect(createResult.status).toBe(201)
    const subscriptionId = createResult.data.id

    // Step 2: Read subscription from list
    const listRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const listResponse = await GET(listRequest)
    const listResult = await parseResponse(listResponse)

    expect(listResult.status).toBe(200)
    expect(listResult.data).toHaveLength(1)
    expect(listResult.data[0].id).toBe(subscriptionId)
    expect(listResult.data[0].name).toBe('Spotify')

    // Step 3: Update subscription
    const updateData = {
      name: 'Spotify Premium',
      amount: 1480,
      notes: 'Upgraded to premium family plan',
    }

    const updateRequest = createTestRequest(
      `http://localhost:3000/api/subscriptions/${subscriptionId}`,
      {
        method: 'PUT',
        body: updateData,
      }
    )
    const updateResponse = await PUT_BY_ID(updateRequest, {
      params: { id: subscriptionId },
    })
    const updateResult = await parseResponse(updateResponse)

    expect(updateResult.status).toBe(200)
    expect(updateResult.data.name).toBe('Spotify Premium')
    expect(updateResult.data.amount).toBe('1480')

    // Step 4: Verify update persisted
    const verifyRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const verifyResponse = await GET(verifyRequest)
    const verifyResult = await parseResponse(verifyResponse)

    expect(verifyResult.data[0].name).toBe('Spotify Premium')
    expect(verifyResult.data[0].amount).toBe('1480')

    // Step 5: Delete subscription
    const deleteRequest = createTestRequest(
      `http://localhost:3000/api/subscriptions/${subscriptionId}`,
      {
        method: 'DELETE',
      }
    )
    const deleteResponse = await DELETE_BY_ID(deleteRequest, {
      params: { id: subscriptionId },
    })
    const deleteResult = await parseResponse(deleteResponse)

    expect(deleteResult.status).toBe(200)

    // Step 6: Verify deletion
    const finalRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const finalResponse = await GET(finalRequest)
    const finalResult = await parseResponse(finalResponse)

    expect(finalResult.status).toBe(200)
    expect(finalResult.data).toHaveLength(0)
  })

  it('handles subscription status transitions correctly', async () => {
    // Create active subscription
    const subscription = await prisma.subscription.create({
      data: createTestSubscription(testUserId, {
        name: 'Active Service',
        isActive: true,
        nextBillingDate: addDays(new Date(), 10),
      }),
    })

    // Step 1: Verify active subscription appears in list
    const activeRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const activeResponse = await GET(activeRequest)
    const activeResult = await parseResponse(activeResponse)

    expect(activeResult.data).toHaveLength(1)
    expect(activeResult.data[0].isActive).toBe(true)

    // Step 2: Cancel subscription (set isActive to false)
    const cancelRequest = createTestRequest(
      `http://localhost:3000/api/subscriptions/${subscription.id}`,
      {
        method: 'PUT',
        body: { isActive: false, cancelledAt: new Date().toISOString() },
      }
    )
    const cancelResponse = await PUT_BY_ID(cancelRequest, {
      params: { id: subscription.id },
    })
    const cancelResult = await parseResponse(cancelResponse)

    expect(cancelResult.status).toBe(200)
    expect(cancelResult.data.isActive).toBe(false)
    expect(cancelResult.data.cancelledAt).toBeTruthy()

    // Step 3: Verify cancelled subscription still appears in list
    const cancelledRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const cancelledResponse = await GET(cancelledRequest)
    const cancelledResult = await parseResponse(cancelledResponse)

    expect(cancelledResult.data).toHaveLength(1)
    expect(cancelledResult.data[0].isActive).toBe(false)

    // Step 4: Reactivate subscription
    const reactivateRequest = createTestRequest(
      `http://localhost:3000/api/subscriptions/${subscription.id}`,
      {
        method: 'PUT',
        body: { isActive: true, cancelledAt: null },
      }
    )
    const reactivateResponse = await PUT_BY_ID(reactivateRequest, {
      params: { id: subscription.id },
    })
    const reactivateResult = await parseResponse(reactivateResponse)

    expect(reactivateResult.status).toBe(200)
    expect(reactivateResult.data.isActive).toBe(true)
    expect(reactivateResult.data.cancelledAt).toBeNull()
  })

  it('manages multiple subscriptions with different billing cycles', async () => {
    // Create subscriptions with different billing cycles
    const subscriptions = [
      {
        name: 'Daily News',
        amount: 100,
        billingCycle: BillingCycle.DAILY,
        nextBillingDate: addDays(new Date(), 1).toISOString(),
      },
      {
        name: 'Weekly Magazine',
        amount: 500,
        billingCycle: BillingCycle.WEEKLY,
        nextBillingDate: addDays(new Date(), 7).toISOString(),
      },
      {
        name: 'Monthly Service',
        amount: 3000,
        billingCycle: BillingCycle.MONTHLY,
        nextBillingDate: addDays(new Date(), 30).toISOString(),
      },
      {
        name: 'Yearly License',
        amount: 120000,
        billingCycle: BillingCycle.YEARLY,
        nextBillingDate: addDays(new Date(), 365).toISOString(),
      },
    ]

    // Create all subscriptions
    for (const sub of subscriptions) {
      const request = createTestRequest(
        'http://localhost:3000/api/subscriptions',
        {
          method: 'POST',
          body: {
            ...sub,
            currency: 'JPY',
            category: Category.OTHER,
          },
        }
      )
      const response = await POST(request)
      const result = await parseResponse(response)
      expect(result.status).toBe(201)
    }

    // Verify all subscriptions created
    const listRequest = createTestRequest(
      'http://localhost:3000/api/subscriptions'
    )
    const listResponse = await GET(listRequest)
    const listResult = await parseResponse(listResponse)

    expect(listResult.status).toBe(200)
    expect(listResult.data).toHaveLength(4)

    // Verify subscriptions are sorted by nextBillingDate (default sorting)
    const sortedNames = listResult.data.map((s: any) => s.name)
    expect(sortedNames).toEqual([
      'Daily News',
      'Weekly Magazine',
      'Monthly Service',
      'Yearly License',
    ])
  })

  it('tracks subscription payment history', async () => {
    // Create subscription with past billing date
    const subscription = await prisma.subscription.create({
      data: createTestSubscription(testUserId, {
        name: 'Past Due Service',
        nextBillingDate: subDays(new Date(), 5), // 5 days ago
      }),
    })

    // Simulate payment creation
    const payment = await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        userId: testUserId,
        amount: subscription.amount,
        currency: subscription.currency,
        paymentDate: new Date(),
        status: 'COMPLETED',
      },
    })

    // Update subscription next billing date after payment
    const updateRequest = createTestRequest(
      `http://localhost:3000/api/subscriptions/${subscription.id}`,
      {
        method: 'PUT',
        body: {
          nextBillingDate: addDays(new Date(), 30).toISOString(),
        },
      }
    )
    const updateResponse = await PUT_BY_ID(updateRequest, {
      params: { id: subscription.id },
    })
    const updateResult = await parseResponse(updateResponse)

    expect(updateResult.status).toBe(200)

    // Verify payment history exists
    const payments = await prisma.payment.findMany({
      where: { subscriptionId: subscription.id },
    })

    expect(payments).toHaveLength(1)
    expect(payments[0].status).toBe('COMPLETED')
    expect(payments[0].amount).toEqual(subscription.amount)
  })

  it('handles subscription reminders', async () => {
    // Create subscription due soon
    const subscription = await prisma.subscription.create({
      data: createTestSubscription(testUserId, {
        name: 'Due Soon Service',
        nextBillingDate: addDays(new Date(), 3), // 3 days from now
      }),
    })

    // Create reminder for subscription
    const reminder = await prisma.reminder.create({
      data: {
        subscriptionId: subscription.id,
        userId: testUserId,
        reminderDate: subDays(subscription.nextBillingDate, 1), // 1 day before due
        message: 'Payment due tomorrow',
        isActive: true,
      },
    })

    // Verify reminder exists and is active
    const reminders = await prisma.reminder.findMany({
      where: {
        subscriptionId: subscription.id,
        isActive: true,
      },
    })

    expect(reminders).toHaveLength(1)
    expect(reminders[0].message).toBe('Payment due tomorrow')

    // Simulate sending reminder (mark as sent)
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        isActive: false,
        sentAt: new Date(),
      },
    })

    // Verify reminder marked as sent
    const sentReminder = await prisma.reminder.findUnique({
      where: { id: reminder.id },
    })

    expect(sentReminder?.isActive).toBe(false)
    expect(sentReminder?.sentAt).toBeTruthy()
  })
})
