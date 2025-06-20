import React from 'react'
import { render as rtlRender } from '@testing-library/react'

// Mock session
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: '2024-12-31',
}

// Custom render function that includes providers
export function render(
  ui: React.ReactElement,
  { session = mockSession, ...renderOptions } = {}
) {
  // Since SessionProvider is mocked in jest.setup.ts, we don't need to wrap with it
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
