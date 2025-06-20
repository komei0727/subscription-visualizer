import { prisma } from '../utils/test-db'
import { createTestUser } from '../utils/test-factories'
import { hash, compare } from 'bcryptjs'

describe('Authentication Database Operations', () => {
  it('creates a user with hashed password', async () => {
    const password = 'securePassword123'
    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email: 'auth-test@example.com',
        name: 'Auth Test User',
        hashedPassword,
      },
    })

    expect(user).toBeDefined()
    expect(user.email).toBe('auth-test@example.com')
    expect(user.hashedPassword).toBeDefined()
    expect(user.hashedPassword).not.toBe(password)

    // Verify password can be checked
    const isValid = await compare(password, user.hashedPassword!)
    expect(isValid).toBe(true)
  })

  it('enforces unique email constraint', async () => {
    const userData = await createTestUser({ email: 'duplicate@example.com' })

    // Create first user
    await prisma.user.create({ data: userData })

    // Try to create second user with same email
    await expect(prisma.user.create({ data: userData })).rejects.toThrow()
  })

  it('creates user without password (for OAuth)', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'oauth@example.com',
        name: 'OAuth User',
        // No hashedPassword - for OAuth providers
      },
    })

    expect(user.hashedPassword).toBeNull()
  })

  it('creates and manages sessions', async () => {
    const user = await prisma.user.create({
      data: await createTestUser(),
    })

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: 'test-session-token',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    expect(session.userId).toBe(user.id)
    expect(session.sessionToken).toBe('test-session-token')

    // Find session by token
    const foundSession = await prisma.session.findUnique({
      where: { sessionToken: 'test-session-token' },
      include: { user: true },
    })

    expect(foundSession).toBeDefined()
    expect(foundSession?.user.id).toBe(user.id)
  })

  it('creates OAuth account link', async () => {
    const user = await prisma.user.create({
      data: await createTestUser(),
    })

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: 'google-123456',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      },
    })

    expect(account.userId).toBe(user.id)
    expect(account.provider).toBe('google')

    // Find user with accounts
    const userWithAccounts = await prisma.user.findUnique({
      where: { id: user.id },
      include: { accounts: true },
    })

    expect(userWithAccounts?.accounts).toHaveLength(1)
    expect(userWithAccounts?.accounts[0].provider).toBe('google')
  })

  it('handles email verification', async () => {
    const user = await prisma.user.create({
      data: {
        ...(await createTestUser()),
        emailVerified: null,
      },
    })

    expect(user.emailVerified).toBeNull()

    // Verify email
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })

    expect(verifiedUser.emailVerified).toBeDefined()
  })

  describe('User Deletion', () => {
    it('cascades delete to sessions and accounts', async () => {
      const user = await prisma.user.create({
        data: await createTestUser(),
      })

      // Create related data
      await prisma.session.create({
        data: {
          userId: user.id,
          sessionToken: 'session-to-delete',
          expires: new Date(Date.now() + 86400000),
        },
      })

      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'github',
          providerAccountId: 'github-123',
        },
      })

      // Delete user
      await prisma.user.delete({
        where: { id: user.id },
      })

      // Verify cascading deletes
      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      })
      expect(sessions).toHaveLength(0)

      const accounts = await prisma.account.findMany({
        where: { userId: user.id },
      })
      expect(accounts).toHaveLength(0)
    })
  })
})
