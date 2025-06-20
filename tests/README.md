# Test Suite Documentation

## Overview
Comprehensive test suite for the Subscription Visualizer application, covering unit tests for components, utilities, and API routes.

## Test Structure

```
tests/
├── unit/                       # Unit tests
│   ├── api/                    # API route tests
│   │   └── subscriptions.test.ts
│   ├── components/             # Component tests
│   │   ├── auth/
│   │   │   ├── login-form.test.tsx
│   │   │   └── user-menu.test.tsx
│   │   ├── layout/
│   │   │   └── sidebar.test.tsx
│   │   └── subscriptions/
│   │       ├── subscription-card.test.tsx
│   │       └── subscription-form.test.tsx
│   └── lib/                    # Utility tests
│       ├── utils.test.ts
│       └── utils/
│           └── subscription.test.ts
├── integration/                # Integration tests (future)
├── e2e/                       # E2E tests (future)
└── utils/                     # Test utilities
    ├── mock-data.ts
    └── test-utils.tsx
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests in CI mode
pnpm test:ci
```

## Test Coverage Goals

- **Target Coverage**: 80% or higher
- **Critical Paths**: 100% coverage for:
  - Authentication flows
  - CRUD operations
  - Payment calculations
  - API endpoints

## Component Tests

### Auth Components
- **LoginForm**: Tests authentication flow, validation, error handling
- **UserMenu**: Tests dropdown behavior, sign out functionality

### Subscription Components
- **SubscriptionCard**: Tests display, edit/delete actions, date calculations
- **SubscriptionForm**: Tests form validation, submission, error handling

### Layout Components
- **Sidebar**: Tests navigation, active state, responsive behavior

## Utility Tests

### Core Utilities
- **cn**: Tests class name merging with tailwind-merge
- **formatAmount**: Tests currency formatting for JPY/USD
- **calculateMonthlyAmount**: Tests billing cycle conversions
- **calculateTotalAmount**: Tests subscription total calculations

## API Tests

### Subscription API
- **GET /api/subscriptions**: Tests authentication, data fetching
- **POST /api/subscriptions**: Tests creation, validation
- **PUT /api/subscriptions/[id]**: Tests updates, authorization
- **DELETE /api/subscriptions/[id]**: Tests deletion, authorization

## Mock Data

Standardized mock data is available in `tests/utils/mock-data.ts`:
- Mock subscriptions with various billing cycles
- Mock user data
- Mock session data

## Test Utilities

Custom render function in `tests/utils/test-utils.tsx`:
- Wraps components with necessary providers
- Includes mock session by default
- Re-exports testing library utilities

## Best Practices

1. **Naming Convention**: Use descriptive test names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
3. **Mock External Dependencies**: Mock API calls, navigation, and authentication
4. **Test User Interactions**: Focus on user behavior rather than implementation details
5. **Cleanup**: Always cleanup mocks and spies after tests

## Common Testing Patterns

### Testing Async Operations
```typescript
await waitFor(() => {
  expect(mockFunction).toHaveBeenCalled()
})
```

### Testing User Events
```typescript
const user = userEvent.setup()
await user.click(button)
await user.type(input, 'text')
```

### Testing API Calls
```typescript
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'test' })
})
```

## Debugging Tests

1. Use `screen.debug()` to see the current DOM
2. Use `console.log` in tests (will be shown in test output)
3. Run specific test file: `pnpm test path/to/test.tsx`
4. Run tests matching pattern: `pnpm test --testNamePattern="LoginForm"`

## CI Integration

Tests are configured to run in CI with:
- Coverage reporting
- Limited workers for stability
- Fail on coverage threshold violations

## Future Improvements

1. Add E2E tests with Playwright
2. Add visual regression tests
3. Add performance tests for large data sets
4. Add accessibility tests with jest-axe
5. Increase coverage for edge cases