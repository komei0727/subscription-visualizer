import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './test-db'

// Mock auth helper that doesn't depend on Next.js context
export async function mockAuth() {
  const mockGetServerSession = jest.fn()

  // Mock the auth-helpers module
  jest.mock('@/lib/auth-helpers', () => ({
    auth: jest.fn(async () => {
      return mockGetServerSession()
    }),
  }))

  // Mock next-auth
  jest.mock('next-auth', () => ({
    getServerSession: mockGetServerSession,
  }))

  jest.mock('next-auth/next', () => ({
    getServerSession: mockGetServerSession,
  }))

  return {
    mockGetServerSession,
    setSession: (session: any) => {
      mockGetServerSession.mockResolvedValue(session)
    },
    clearSession: () => {
      mockGetServerSession.mockResolvedValue(null)
    },
  }
}

// Create a mock NextRequest that bypasses Next.js internals
export function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
  } = {}
) {
  const { method = 'GET', body, headers = {} } = options

  // Create a mock request object
  const mockRequest = {
    method,
    url,
    headers: new Headers({
      'content-type': 'application/json',
      ...headers,
    }),
    json: async () => body,
    text: async () => JSON.stringify(body),
    formData: async () => new FormData(),
    nextUrl: new URL(url),
  }

  return mockRequest as unknown as NextRequest
}

// Helper to call API routes directly without Next.js context
export async function callApiRoute(
  routeHandler: Function,
  request: NextRequest,
  params?: any
) {
  try {
    const response = await routeHandler(request, params)
    return response
  } catch (error) {
    // If error is due to Next.js context, return a mock error response
    if (error instanceof Error && error.message.includes('headers()')) {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
    throw error
  }
}
