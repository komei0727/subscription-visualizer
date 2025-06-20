import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockRefresh = jest.fn()
const mockBack = jest.fn()
const mockForward = jest.fn()
const mockPrefetch = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
      replace: mockReplace,
      refresh: mockRefresh,
      back: mockBack,
      forward: mockForward,
      prefetch: mockPrefetch,
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  redirect: jest.fn(),
}))

// Export mocks for tests
global.mockRouterPush = mockPush
global.mockRouterReplace = mockReplace
global.mockRouterRefresh = mockRefresh
global.mockRouterBack = mockBack

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
    },
    status: 'authenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

// Mock global objects for Node.js environment
if (typeof global.Request === 'undefined') {
  global.Request = jest.fn() as any
}

if (typeof global.Response === 'undefined') {
  global.Response = jest.fn() as any
}

if (typeof global.Headers === 'undefined') {
  global.Headers = jest.fn() as any
}

// Mock fetch
global.fetch = jest.fn()

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...(init?.headers || {}),
        },
      })
      return response
    },
  },
  NextRequest: class {
    private _body: string
    public url: string

    constructor(url: string, init?: RequestInit & { body?: string }) {
      this.url = url
      this._body = init?.body || ''
      Object.assign(this, init)
    }

    async json() {
      return JSON.parse(this._body)
    }
  },
}))
