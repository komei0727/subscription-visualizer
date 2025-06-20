import { render, screen, waitFor } from '@/tests/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/login-form'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  signIn: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

describe('LoginForm', () => {
  const mockPush = jest.fn()
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('renders login form with all fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Googleでログイン/i })).toBeInTheDocument()
  })

  it('displays default demo credentials', () => {
    render(<LoginForm />)

    expect(screen.getByDisplayValue('demo@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('demo1234')).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ ok: true, error: null } as any)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: /ログイン/i })

    await user.clear(emailInput)
    await user.type(emailInput, 'user@example.com')
    await user.clear(passwordInput)
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'user@example.com',
        password: 'password123',
        redirect: false,
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ ok: false, error: 'Invalid credentials' } as any)

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/メールアドレスまたはパスワードが正しくありません/i)).toBeInTheDocument()
    })
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /ログイン/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent(/ログイン中.../i)
  })

  it('handles Google sign in', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    const googleButton = screen.getByRole('button', { name: /Googleでログイン/i })
    await user.click(googleButton)

    expect(mockSignIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)

    await user.clear(emailInput)
    await user.clear(passwordInput)
    await user.click(screen.getByRole('button', { name: /ログイン/i }))

    // Note: Validation messages depend on the actual implementation
    // This test assumes HTML5 validation is being used
    expect(emailInput).toBeInvalid()
    expect(passwordInput).toBeInvalid()
  })
})