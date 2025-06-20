import {
  formatAmount,
  calculateMonthlyAmount,
  calculateTotalAmount,
} from '@/lib/utils/subscription'
import { BillingCycle } from '@/types/subscription'

describe('Subscription Utilities', () => {
  describe('formatAmount', () => {
    it('formats JPY currency correctly', () => {
      expect(formatAmount(1000, 'JPY')).toBe('¥1,000')
      expect(formatAmount(1234567, 'JPY')).toBe('¥1,234,567')
      expect(formatAmount(0, 'JPY')).toBe('¥0')
    })

    it('formats USD currency correctly', () => {
      expect(formatAmount(1000, 'USD')).toBe('$1,000.00')
      expect(formatAmount(1234.56, 'USD')).toBe('$1,234.56')
    })

    it('handles default currency', () => {
      expect(formatAmount(1000)).toBe('¥1,000')
    })

    it('handles negative amounts', () => {
      expect(formatAmount(-1000, 'JPY')).toBe('-¥1,000')
      expect(formatAmount(-1000, 'USD')).toBe('-$1,000.00')
    })
  })

  describe('calculateMonthlyAmount', () => {
    it('returns correct amount for MONTHLY billing', () => {
      expect(calculateMonthlyAmount(1000, BillingCycle.MONTHLY)).toBe(1000)
    })

    it('calculates correct amount for YEARLY billing', () => {
      expect(calculateMonthlyAmount(12000, BillingCycle.YEARLY)).toBe(1000)
    })

    it('calculates correct amount for WEEKLY billing', () => {
      // Approximately 4.33 weeks per month
      expect(calculateMonthlyAmount(1000, BillingCycle.WEEKLY)).toBeCloseTo(
        4333.33,
        2
      )
    })

    it('calculates correct amount for DAILY billing', () => {
      // 30 days per month
      expect(calculateMonthlyAmount(100, BillingCycle.DAILY)).toBe(3000)
    })

    it('calculates correct amount for QUARTERLY billing', () => {
      // 3 months per quarter
      expect(calculateMonthlyAmount(3000, BillingCycle.QUARTERLY)).toBe(1000)
    })

    it('calculates correct amount for SEMI_ANNUAL billing', () => {
      // 6 months per semi-annual
      expect(calculateMonthlyAmount(6000, BillingCycle.SEMI_ANNUAL)).toBe(1000)
    })

    it('returns 0 for LIFETIME billing', () => {
      expect(calculateMonthlyAmount(10000, BillingCycle.LIFETIME)).toBe(0)
    })

    it('handles zero amount', () => {
      expect(calculateMonthlyAmount(0, BillingCycle.MONTHLY)).toBe(0)
      expect(calculateMonthlyAmount(0, BillingCycle.YEARLY)).toBe(0)
    })

    it('handles fractional amounts', () => {
      expect(calculateMonthlyAmount(100.5, BillingCycle.MONTHLY)).toBe(100.5)
      expect(calculateMonthlyAmount(1206, BillingCycle.YEARLY)).toBe(100.5)
    })
  })

  describe('calculateTotalAmount', () => {
    const mockSubscriptions = [
      {
        id: '1',
        amount: 1000,
        billingCycle: BillingCycle.MONTHLY,
        isActive: true,
      },
      {
        id: '2',
        amount: 12000,
        billingCycle: BillingCycle.YEARLY,
        isActive: true,
      },
      {
        id: '3',
        amount: 500,
        billingCycle: BillingCycle.MONTHLY,
        isActive: false,
      },
    ] as any[]

    it('calculates total monthly amount for active subscriptions', () => {
      const total = calculateTotalAmount(mockSubscriptions)
      // 1000 (monthly) + 1000 (yearly converted to monthly)
      expect(total).toBe(2000)
    })

    it('excludes inactive subscriptions', () => {
      const total = calculateTotalAmount(mockSubscriptions)
      expect(total).toBe(2000) // Should not include the 500 from inactive subscription
    })

    it('includes inactive subscriptions when specified', () => {
      const total = calculateTotalAmount(mockSubscriptions, false)
      // 1000 + 1000 + 500
      expect(total).toBe(2500)
    })

    it('handles empty array', () => {
      expect(calculateTotalAmount([])).toBe(0)
    })

    it('handles all inactive subscriptions', () => {
      const inactiveSubscriptions = mockSubscriptions.map((sub) => ({
        ...sub,
        isActive: false,
      }))
      expect(calculateTotalAmount(inactiveSubscriptions)).toBe(0)
      expect(calculateTotalAmount(inactiveSubscriptions, false)).toBe(2500)
    })

    it('handles mixed billing cycles', () => {
      const mixedSubscriptions = [
        {
          id: '1',
          amount: 100,
          billingCycle: BillingCycle.DAILY,
          isActive: true,
        },
        {
          id: '2',
          amount: 1000,
          billingCycle: BillingCycle.WEEKLY,
          isActive: true,
        },
        {
          id: '3',
          amount: 3000,
          billingCycle: BillingCycle.QUARTERLY,
          isActive: true,
        },
      ] as any[]

      const total = calculateTotalAmount(mixedSubscriptions)
      // 3000 (daily) + 4333.33 (weekly) + 1000 (quarterly)
      expect(total).toBeCloseTo(8333.33, 2)
    })

    it('handles decimal amounts correctly', () => {
      const decimalSubscriptions = [
        {
          id: '1',
          amount: 99.99,
          billingCycle: BillingCycle.MONTHLY,
          isActive: true,
        },
        {
          id: '2',
          amount: 199.99,
          billingCycle: BillingCycle.MONTHLY,
          isActive: true,
        },
      ] as any[]

      expect(calculateTotalAmount(decimalSubscriptions)).toBeCloseTo(299.98, 2)
    })
  })
})
