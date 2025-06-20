import {
  setupTestDatabase,
  teardownTestDatabase,
  cleanupDatabase,
} from './utils/test-db'

// Setup test database before all tests
beforeAll(async () => {
  await setupTestDatabase()
})

// Clean up database before each test
beforeEach(async () => {
  await cleanupDatabase()
})

// Teardown test database after all tests
afterAll(async () => {
  await teardownTestDatabase()
})

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers || {}),
        },
      })
    },
  },
  NextRequest: class {
    constructor(
      public url: string,
      private init?: RequestInit
    ) {
      this.method = init?.method || 'GET'
      this.headers = new Headers(init?.headers)
      this.body = init?.body
    }

    method: string
    headers: Headers
    body: any

    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body)
      }
      return this.body
    }
  },
}))
