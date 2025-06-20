import { render, screen, waitFor } from '@/tests/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { mockSubscriptions } from '@/tests/utils/mock-data'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

describe('SubscriptionForm', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    global.mockRouterPush.mockClear()
    global.mockRouterBack.mockClear()
    global.mockRouterRefresh.mockClear()
  })

  it('renders form with all fields for new subscription', () => {
    render(<SubscriptionForm />)

    expect(screen.getByLabelText(/サービス名/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/金額/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/支払いサイクル/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/次回支払日/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/カテゴリ/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/メモ/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /追加/i })).toBeInTheDocument()
  })

  it('renders form with subscription data for editing', () => {
    render(<SubscriptionForm subscription={mockSubscriptions[0]} />)

    expect(screen.getByDisplayValue('Netflix')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1980')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Premium plan')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /更新/i })).toBeInTheDocument()
  })

  it('submits new subscription successfully', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-id' }),
    } as Response)

    render(<SubscriptionForm />)

    // Fill form
    await user.type(screen.getByLabelText(/サービス名/i), 'New Service')
    await user.clear(screen.getByLabelText(/金額/i))
    await user.type(screen.getByLabelText(/金額/i), '2000')
    await user.type(screen.getByLabelText(/メモ/i), 'Test notes')

    // Submit form
    await user.click(screen.getByRole('button', { name: /追加/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"name":"New Service"'),
      })
      expect(global.mockRouterPush).toHaveBeenCalledWith('/subscriptions')
      expect(global.mockRouterRefresh).toHaveBeenCalled()
    })
  })

  it('updates existing subscription successfully', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockSubscriptions[0], name: 'Updated Netflix' }),
    } as Response)

    render(<SubscriptionForm subscription={mockSubscriptions[0]} />)

    // Update name
    await user.clear(screen.getByLabelText(/サービス名/i))
    await user.type(screen.getByLabelText(/サービス名/i), 'Updated Netflix')

    // Submit form
    await user.click(screen.getByRole('button', { name: /更新/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"name":"Updated Netflix"'),
      })
      expect(global.mockRouterPush).toHaveBeenCalledWith('/subscriptions')
    })
  })

  it('displays validation errors', async () => {
    const user = userEvent.setup()
    render(<SubscriptionForm />)

    // Clear required field and submit
    const nameInput = screen.getByLabelText(/サービス名/i)
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /追加/i }))

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/名前は必須です/i)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    } as Response)

    render(<SubscriptionForm />)

    await user.type(screen.getByLabelText(/サービス名/i), 'Test Service')
    await user.clear(screen.getByLabelText(/金額/i))
    await user.type(screen.getByLabelText(/金額/i), '1000')
    await user.click(screen.getByRole('button', { name: /追加/i }))

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
      expect(global.mockRouterPush).not.toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    
    // Create a promise that we can control
    let resolveSubmit: () => void
    const submitPromise = new Promise<Response>((resolve) => {
      resolveSubmit = () => resolve({
        ok: true,
        json: async () => ({ id: 'new-id' }),
      } as Response)
    })
    
    mockFetch.mockReturnValueOnce(submitPromise)

    render(<SubscriptionForm />)

    await user.type(screen.getByLabelText(/サービス名/i), 'Test Service')
    await user.clear(screen.getByLabelText(/金額/i))
    await user.type(screen.getByLabelText(/金額/i), '1000')
    
    const submitButton = screen.getByRole('button', { name: /追加/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveTextContent('保存中...')

    // Resolve the submission
    resolveSubmit!()
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('navigates back on cancel', async () => {
    const user = userEvent.setup()
    render(<SubscriptionForm />)

    await user.click(screen.getByRole('button', { name: /キャンセル/i }))
    expect(global.mockRouterBack).toHaveBeenCalled()
  })

  it('formats date correctly in payload', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-id' }),
    } as Response)

    render(<SubscriptionForm />)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const formattedDate = format(tomorrow, 'yyyy-MM-dd')

    await user.type(screen.getByLabelText(/サービス名/i), 'Test Service')
    await user.clear(screen.getByLabelText(/金額/i))
    await user.type(screen.getByLabelText(/金額/i), '1000')
    await user.clear(screen.getByLabelText(/次回支払日/i))
    await user.type(screen.getByLabelText(/次回支払日/i), formattedDate)
    await user.click(screen.getByRole('button', { name: /追加/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      const callBody = JSON.parse((mockFetch.mock.calls[0][1] as any).body)
      expect(callBody.nextBillingDate).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })
  })

  it('validates amount as positive number', async () => {
    const user = userEvent.setup()
    render(<SubscriptionForm />)

    await user.type(screen.getByLabelText(/サービス名/i), 'Test')
    await user.clear(screen.getByLabelText(/金額/i))
    await user.type(screen.getByLabelText(/金額/i), '-100')
    await user.click(screen.getByRole('button', { name: /追加/i }))

    await waitFor(() => {
      expect(screen.getByText(/金額は正の数値を入力してください/i)).toBeInTheDocument()
    })
  })
})