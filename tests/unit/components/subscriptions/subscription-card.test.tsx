import { render, screen, waitFor } from '@/tests/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { SubscriptionCard } from '@/components/subscriptions/subscription-card'
import { mockSubscriptions } from '@/tests/utils/mock-data'
import { useRouter } from 'next/navigation'

// Mock fetch
global.fetch = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('SubscriptionCard', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders subscription details correctly', () => {
    render(<SubscriptionCard subscription={mockSubscriptions[0]} />)

    expect(screen.getByText('Netflix')).toBeInTheDocument()
    expect(screen.getByText('エンターテインメント')).toBeInTheDocument()
    expect(screen.getByText('¥1,980')).toBeInTheDocument()
    expect(screen.getByText('/月')).toBeInTheDocument()
    expect(screen.getByText('Premium plan')).toBeInTheDocument()
  })

  it('shows correct billing countdown', () => {
    const subscription = {
      ...mockSubscriptions[0],
      nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    }

    render(<SubscriptionCard subscription={subscription} />)
    expect(screen.getByText('5日後')).toBeInTheDocument()
  })

  it('applies correct color based on billing date proximity', () => {
    // Test red color for <= 7 days
    const urgentSub = {
      ...mockSubscriptions[0],
      nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    }
    const { rerender } = render(<SubscriptionCard subscription={urgentSub} />)
    expect(screen.getByText('5日後')).toHaveClass('bg-red-100', 'text-red-800')

    // Test yellow color for <= 14 days
    const warningSub = {
      ...mockSubscriptions[0],
      nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    }
    rerender(<SubscriptionCard subscription={warningSub} />)
    expect(screen.getByText('10日後')).toHaveClass('bg-yellow-100', 'text-yellow-800')

    // Test green color for > 14 days
    const safeSub = {
      ...mockSubscriptions[0],
      nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    }
    rerender(<SubscriptionCard subscription={safeSub} />)
    expect(screen.getByText('20日後')).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('navigates to edit page on edit button click', async () => {
    const user = userEvent.setup()
    render(<SubscriptionCard subscription={mockSubscriptions[0]} />)

    const editButton = screen.getByRole('button', { name: '' })
    const buttons = screen.getAllByRole('button')
    const editBtn = buttons.find(btn => btn.querySelector('.lucide-edit'))
    
    await user.click(editBtn!)
    expect(mockPush).toHaveBeenCalledWith('/subscriptions/1')
  })

  it('handles deletion with confirmation', async () => {
    const user = userEvent.setup()
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<SubscriptionCard subscription={mockSubscriptions[0]} />)

    const buttons = screen.getAllByRole('button')
    const deleteBtn = buttons.find(btn => btn.querySelector('.lucide-trash2'))

    await user.click(deleteBtn!)

    expect(confirmSpy).toHaveBeenCalledWith('このサブスクリプションを削除してもよろしいですか？')
    expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions/1', {
      method: 'DELETE',
    })

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    })

    confirmSpy.mockRestore()
  })

  it('cancels deletion when user declines confirmation', async () => {
    const user = userEvent.setup()
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false)

    render(<SubscriptionCard subscription={mockSubscriptions[0]} />)

    const buttons = screen.getAllByRole('button')
    const deleteBtn = buttons.find(btn => btn.querySelector('.lucide-trash2'))

    await user.click(deleteBtn!)

    expect(confirmSpy).toHaveBeenCalled()
    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('disables delete button during deletion', async () => {
    const user = userEvent.setup()
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
    
    // Create a promise that we can control
    let resolveDelete: () => void
    const deletePromise = new Promise<Response>((resolve) => {
      resolveDelete = () => resolve({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)
    })
    
    mockFetch.mockReturnValueOnce(deletePromise)

    render(<SubscriptionCard subscription={mockSubscriptions[0]} />)

    const buttons = screen.getAllByRole('button')
    const deleteBtn = buttons.find(btn => btn.querySelector('.lucide-trash2'))

    await user.click(deleteBtn!)

    expect(deleteBtn).toBeDisabled()

    // Resolve the deletion
    resolveDelete!()
    
    await waitFor(() => {
      expect(deleteBtn).not.toBeDisabled()
    })

    confirmSpy.mockRestore()
  })

  it('handles deletion error gracefully', async () => {
    const user = userEvent.setup()
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<SubscriptionCard subscription={mockSubscriptions[0]} />)

    const buttons = screen.getAllByRole('button')
    const deleteBtn = buttons.find(btn => btn.querySelector('.lucide-trash2'))

    await user.click(deleteBtn!)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Delete error:', expect.any(Error))
      expect(mockRefresh).not.toHaveBeenCalled()
    })

    confirmSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('renders without notes when notes are null', () => {
    const subscriptionWithoutNotes = {
      ...mockSubscriptions[1],
      notes: null,
    }

    render(<SubscriptionCard subscription={subscriptionWithoutNotes} />)
    
    expect(screen.queryByText('Premium plan')).not.toBeInTheDocument()
  })
})