import { render, screen } from '@/tests/unit/utils/test-utils'
import { Sidebar } from '@/components/layout/sidebar'
import { usePathname } from 'next/navigation'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

describe('Sidebar', () => {
  const mockUsePathname = usePathname as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all navigation items', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<Sidebar />)

    expect(screen.getByText('ダッシュボード')).toBeInTheDocument()
    expect(screen.getByText('サブスクリプション')).toBeInTheDocument()
    expect(screen.getByText('分析')).toBeInTheDocument()
    expect(screen.getByText('設定')).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    mockUsePathname.mockReturnValue('/subscriptions')
    render(<Sidebar />)

    const subscriptionsLink = screen.getByText('サブスクリプション').closest('a')
    expect(subscriptionsLink).toHaveClass('bg-gray-100', 'text-gray-900')

    const dashboardLink = screen.getByText('ダッシュボード').closest('a')
    expect(dashboardLink).not.toHaveClass('bg-gray-100')
    expect(dashboardLink).toHaveClass('text-gray-600')
  })

  it('highlights parent item for nested routes', () => {
    mockUsePathname.mockReturnValue('/subscriptions/new')
    render(<Sidebar />)

    const subscriptionsLink = screen.getByText('サブスクリプション').closest('a')
    expect(subscriptionsLink).toHaveClass('bg-gray-100', 'text-gray-900')
  })

  it('renders correct icons for navigation items', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<Sidebar />)

    // Check that icons are rendered (by checking SVG elements)
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('has correct href attributes', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<Sidebar />)

    expect(screen.getByText('ダッシュボード').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('サブスクリプション').closest('a')).toHaveAttribute('href', '/subscriptions')
    expect(screen.getByText('分析').closest('a')).toHaveAttribute('href', '/analytics')
    expect(screen.getByText('設定').closest('a')).toHaveAttribute('href', '/settings')
  })

  it('is hidden on mobile', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    const { container } = render(<Sidebar />)

    const sidebar = container.querySelector('aside')
    expect(sidebar).toHaveClass('hidden', 'lg:block')
  })
})