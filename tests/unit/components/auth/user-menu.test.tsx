import { render, screen, waitFor } from '@/tests/unit/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { UserMenu } from '@/components/auth/user-menu'
import { useSession, signOut } from 'next-auth/react'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}))

describe('UserMenu', () => {
  const mockSignOut = signOut as jest.MockedFunction<typeof signOut>
  const mockUseSession = useSession as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    const { container } = render(<UserMenu />)
    expect(container.firstChild).toBeNull()
  })

  it('renders user menu when authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    })

    render(<UserMenu />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('shows email when name is not available', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          name: null,
        },
      },
      status: 'authenticated',
    })

    render(<UserMenu />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('toggles dropdown menu on click', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    })

    render(<UserMenu />)

    // Dropdown should be closed initially
    expect(screen.queryByText(/ログアウト/i)).not.toBeInTheDocument()

    // Click to open
    await user.click(screen.getByText('Test User'))
    expect(screen.getByText(/ログアウト/i)).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()

    // Click to close
    await user.click(screen.getByText('Test User'))
    expect(screen.queryByText(/ログアウト/i)).not.toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    })

    render(<UserMenu />)

    // Open dropdown
    await user.click(screen.getByText('Test User'))
    expect(screen.getByText(/ログアウト/i)).toBeInTheDocument()

    // Click on the overlay which is the fixed inset-0 div
    const overlay = document.querySelector('.fixed.inset-0')
    if (overlay) {
      await user.click(overlay)
    }

    await waitFor(() => {
      expect(screen.queryByText(/ログアウト/i)).not.toBeInTheDocument()
    })
  })

  it('handles sign out', async () => {
    const user = userEvent.setup()
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
      status: 'authenticated',
    })

    render(<UserMenu />)

    // Open dropdown
    await user.click(screen.getByText('Test User'))

    // Click sign out
    await user.click(screen.getByText(/ログアウト/i))

    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
  })
})
