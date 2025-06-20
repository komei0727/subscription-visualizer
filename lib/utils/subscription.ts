import { BillingCycle, Subscription } from '@/types/subscription'
import { addDays, addWeeks, addMonths, addYears } from 'date-fns'

/**
 * サブスクリプションの月額換算金額を計算
 */
export function calculateMonthlyAmount(
  amount: number,
  billingCycle: BillingCycle
): number {
  switch (billingCycle) {
    case 'DAILY':
      return amount * 30
    case 'WEEKLY':
      return amount * (52 / 12) // 52週/12ヶ月 ≈ 4.333...
    case 'MONTHLY':
      return amount
    case 'QUARTERLY':
      return amount / 3
    case 'SEMI_ANNUAL':
      return amount / 6
    case 'YEARLY':
      return amount / 12
    case 'LIFETIME':
      return 0 // 買い切りは月額0円
    case 'CUSTOM':
      return amount // カスタムは月額として扱う
    default:
      return amount
  }
}

/**
 * 次回支払日を計算
 */
export function calculateNextBillingDate(
  currentDate: Date,
  billingCycle: BillingCycle
): Date {
  switch (billingCycle) {
    case 'DAILY':
      return addDays(currentDate, 1)
    case 'WEEKLY':
      return addWeeks(currentDate, 1)
    case 'MONTHLY':
      return addMonths(currentDate, 1)
    case 'QUARTERLY':
      return addMonths(currentDate, 3)
    case 'SEMI_ANNUAL':
      return addMonths(currentDate, 6)
    case 'YEARLY':
      return addYears(currentDate, 1)
    case 'LIFETIME':
      return addYears(currentDate, 100) // 実質的に無期限
    case 'CUSTOM':
      return addMonths(currentDate, 1) // デフォルトは1ヶ月
    default:
      return addMonths(currentDate, 1)
  }
}

/**
 * 年額換算金額を計算
 */
export function calculateYearlyAmount(
  amount: number,
  billingCycle: BillingCycle
): number {
  return calculateMonthlyAmount(amount, billingCycle) * 12
}

/**
 * 支払日までの日数を計算
 */
export function getDaysUntilBilling(nextBillingDate: Date | string): number {
  const next = new Date(nextBillingDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  next.setHours(0, 0, 0, 0)
  
  const diffTime = next.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * サブスクリプションの緊急度を判定
 */
export function getUrgencyLevel(daysUntilBilling: number): 'high' | 'medium' | 'low' {
  if (daysUntilBilling <= 3) return 'high'
  if (daysUntilBilling <= 7) return 'medium'
  return 'low'
}

/**
 * 通貨記号を取得
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    JPY: '¥',
    USD: '$',
    EUR: '€',
    GBP: '£',
  }
  return symbols[currency] || currency
}

/**
 * 金額をフォーマット
 */
export function formatAmount(amount: number, currency: string = 'JPY'): string {
  const symbol = getCurrencySymbol(currency)
  
  if (currency === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`
  }
  
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * サブスクリプションの合計月額を計算
 */
export function calculateTotalAmount(
  subscriptions: Pick<Subscription, 'amount' | 'billingCycle' | 'isActive'>[],
  activeOnly: boolean = true
): number {
  const filtered = activeOnly ? subscriptions.filter(s => s.isActive) : subscriptions
  
  return filtered.reduce((total, sub) => {
    return total + calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
  }, 0)
}

/**
 * サブスクリプションリストから統計情報を計算
 */
export function calculateSubscriptionStats(subscriptions: Subscription[]) {
  const activeSubscriptions = subscriptions.filter(s => s.isActive)
  
  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    return total + calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
  }, 0)
  
  const yearlyTotal = monthlyTotal * 12
  
  const categoryBreakdown = activeSubscriptions.reduce((acc, sub) => {
    const monthlyAmount = calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
    if (!acc[sub.category]) {
      acc[sub.category] = 0
    }
    acc[sub.category] += monthlyAmount
    return acc
  }, {} as Record<string, number>)
  
  const upcomingPayments = activeSubscriptions.filter(sub => {
    const days = getDaysUntilBilling(sub.nextBillingDate)
    return days >= 0 && days <= 30
  }).sort((a, b) => {
    return getDaysUntilBilling(a.nextBillingDate) - getDaysUntilBilling(b.nextBillingDate)
  })
  
  return {
    activeCount: activeSubscriptions.length,
    totalCount: subscriptions.length,
    monthlyTotal,
    yearlyTotal,
    categoryBreakdown,
    upcomingPayments,
  }
}