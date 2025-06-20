import { render, screen, waitFor } from '@/tests/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/login-form'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

describe('LoginForm', () => {
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mockSignIn for each test
    mockSignIn.mockReset()
    // Clear router mocks
    global.mockRouterPush.mockClear()
  })

  it('renders login form with all fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument()
    // Use more specific selector since there might be multiple buttons
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Googleでログイン/i })).toBeInTheDocument()
  })

  it('displays empty form fields', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/パスワード/i) as HTMLInputElement
    
    expect(emailInput.value).toBe('')
    expect(passwordInput.value).toBe('')
  })

  it('handles successful login', async () => {
    const user = userEvent.setup()
    // Mock successful sign in with no error
    mockSignIn.mockResolvedValueOnce({ error: null })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
    })
    
    await waitFor(() => {
      expect(global.mockRouterPush).toHaveBeenCalledWith('/dashboard')
    }, { timeout: 3000 })
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({ ok: false, error: 'Invalid credentials' } as any)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/メールアドレスまたはパスワードが正しくありません/i)).toBeInTheDocument()
    })
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/メールアドレス/i)
    const passwordInput = screen.getByLabelText(/パスワード/i)
    const submitButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
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
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    // Note: Validation messages depend on the actual implementation
    // This test assumes HTML5 validation is being used
    expect(emailInput).toBeInvalid()
    expect(passwordInput).toBeInvalid()
  })
})