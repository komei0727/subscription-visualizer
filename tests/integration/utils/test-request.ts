import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock NextAuth session
export function mockSession(userId: string, email: string) {
  const session = {
    user: {
      id: userId,
      email,
      name: 'Test User',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  }

  // Mock getServerSession to return our test session
  jest
    .spyOn(require('next-auth'), 'getServerSession')
    .mockImplementation(async () => session)

  return session
}

// Create test request
export function createTestRequest(
  url: string,
  options: {
    method?: string
    body?: any
    headers?: Record<string, string>
  } = {}
) {
  const { method = 'GET', body, headers = {} } = options

  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return request
}

// Parse response
export async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return {
      status: response.status,
      data: await response.json(),
      headers: Object.fromEntries(response.headers.entries()),
    }
  }

  return {
    status: response.status,
    data: await response.text(),
    headers: Object.fromEntries(response.headers.entries()),
  }
}
