import { prisma } from '../utils/test-db'
import { createTestUser, createTestSubscription } from '../utils/test-factories'
import { addDays, subDays } from 'date-fns'

describe('Reminder Database Operations', () => {
  let testUser: any
  let testUserId: string
  let subscription: any

  beforeEach(async () => {
    const userData = await createTestUser()
    testUser = await prisma.user.create({ data: userData })
    testUserId = testUser.id
    
    // Create a subscription for reminder tests
    subscription = await prisma.subscription.create({
      data: createTestSubscription(testUserId, {
        name: 'Reminder Test Service',
        nextBillingDate: addDays(new Date(), 7),
      }),
    })
  })

  it('creates a reminder for subscription', async () => {
    const reminder = await prisma.reminder.create({
      data: {
        subscriptionId: subscription.id,
        daysBefore: 3,
        isEnabled: true,
      },
    })

    expect(reminder).toBeDefined()
    expect(reminder.subscriptionId).toBe(subscription.id)
    expect(reminder.daysBefore).toBe(3)
    expect(reminder.isEnabled).toBe(true)
    expect(reminder.lastSentAt).toBeNull()
  })

  it('enforces unique constraint on subscriptionId and daysBefore', async () => {
    // Create first reminder
    await prisma.reminder.create({
      data: {
        subscriptionId: subscription.id,
        daysBefore: 3,
      },
    })

    // Try to create duplicate
    await expect(
      prisma.reminder.create({
        data: {
          subscriptionId: subscription.id,
          daysBefore: 3,
        },
      })
    ).rejects.toThrow()
  })

  it('allows multiple reminders with different daysBefore values', async () => {
    const reminders = await Promise.all([
      prisma.reminder.create({
        data: {
          subscriptionId: subscription.id,
          daysBefore: 1,
        },
      }),
      prisma.reminder.create({
        data: {
          subscriptionId: subscription.id,
          daysBefore: 3,
        },
      }),
      prisma.reminder.create({
        data: {
          subscriptionId: subscription.id,
          daysBefore: 7,
        },
      }),
    ])

    expect(reminders).toHaveLength(3)
    expect(reminders.map(r => r.daysBefore).sort()).toEqual([1, 3, 7])
  })

  it('tracks when reminders are sent', async () => {
    const reminder = await prisma.reminder.create({
      data: {
        subscriptionId: subscription.id,
        daysBefore: 1,
      },
    })

    // Mark reminder as sent
    const updatedReminder = await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        lastSentAt: new Date(),
      },
    })

    expect(updatedReminder.lastSentAt).toBeDefined()
  })

  it('finds enabled reminders that need to be sent', async () => {
    // Create various reminders
    await Promise.all([
      // Should be sent (due tomorrow, reminder 1 day before)
      prisma.reminder.create({
        data: {
          subscriptionId: subscription.id,
          daysBefore: 6, // Subscription is due in 7 days, so 6 days before = tomorrow
          isEnabled: true,
        },
      }),
      // Already sent today
      prisma.reminder.create({
        data: {
          subscriptionId: (await prisma.subscription.create({
            data: createTestSubscription(testUserId, {
              name: 'Already Notified',
              nextBillingDate: addDays(new Date(), 3),
            }),
          })).id,
          daysBefore: 2,
          isEnabled: true,
          lastSentAt: new Date(),
        },
      }),
      // Disabled
      prisma.reminder.create({
        data: {
          subscriptionId: (await prisma.subscription.create({
            data: createTestSubscription(testUserId, {
              name: 'Disabled Reminder',
              nextBillingDate: addDays(new Date(), 2),
            }),
          })).id,
          daysBefore: 1,
          isEnabled: false,
        },
      }),
    ])

    // Find reminders that should be sent
    const remindersToSend = await prisma.reminder.findMany({
      where: {
        isEnabled: true,
        OR: [
          { lastSentAt: null },
          { lastSentAt: { lt: subDays(new Date(), 1) } }, // Not sent in last 24 hours
        ],
      },
      include: {
        subscription: true,
      },
    })

    // Should have at least one reminder that needs to be sent
    expect(remindersToSend.length).toBeGreaterThanOrEqual(1)
  })

  it('deletes reminders when subscription is deleted', async () => {
    // Create reminders
    await Promise.all([
      prisma.reminder.create({
        data: {
          subscriptionId: subscription.id,
          daysBefore: 1,
        },
      }),
      prisma.reminder.create({
        data: {
          subscriptionId: subscription.id,
          daysBefore: 3,
        },
      }),
    ])

    // Delete subscription
    await prisma.subscription.delete({
      where: { id: subscription.id },
    })

    // Check reminders are deleted
    const reminders = await prisma.reminder.findMany({
      where: { subscriptionId: subscription.id },
    })

    expect(reminders).toHaveLength(0)
  })
})