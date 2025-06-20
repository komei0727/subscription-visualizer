// Mock Next.js server components environment
import { jest } from '@jest/globals'

// Create a mock for requestAsyncStorage
const mockAsyncLocalStorage = {
  getStore: () => ({
    headers: new Map([
      ['host', 'localhost:3000'],
      ['user-agent', 'test-agent'],
    ]),
    cookies: new Map(),
  }),
  run: (store: any, callback: Function) => callback(),
  exit: (callback: Function) => callback(),
  enterWith: () => {},
}

// Mock Next.js modules
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn((key: string) => {
      const store = mockAsyncLocalStorage.getStore()
      return store?.headers.get(key.toLowerCase())
    }),
    forEach: jest.fn(),
    entries: jest.fn(() => []),
    keys: jest.fn(() => []),
    values: jest.fn(() => []),
    has: jest.fn(() => false),
  })),
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getAll: jest.fn(() => []),
  })),
}))

// Mock Next.js internal modules
jest.mock('next/dist/client/components/request-async-storage.external', () => ({
  requestAsyncStorage: mockAsyncLocalStorage,
}), { virtual: true })

// Set up global environment
global.requestAsyncStorage = mockAsyncLocalStorage

// Mock NextAuth with proper async storage context
jest.mock('next-auth', () => ({
  default: jest.fn(),
  getServerSession: jest.fn(),
}))

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))