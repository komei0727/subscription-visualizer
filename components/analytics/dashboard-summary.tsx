'use client'

import { Subscription } from '@/types/subscription'
import { CreditCard, TrendingUp, Calendar, AlertCircle } from 'lucide-react'

interface DashboardSummaryProps {
  subscriptions: Subscription[]
}

export function DashboardSummary({ subscriptions }: DashboardSummaryProps) {
  const activeSubscriptions = subscriptions.filter((s) => s.isActive)

  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    let monthlyAmount = Number(sub.amount)

    // 年額・四半期を月額に換算
    if (sub.billingCycle === 'YEARLY') {
      monthlyAmount = monthlyAmount / 12
    } else if (sub.billingCycle === 'QUARTERLY') {
      monthlyAmount = monthlyAmount / 3
    }

    return total + monthlyAmount
  }, 0)

  const yearlyTotal = monthlyTotal * 12

  const upcomingPayments = activeSubscriptions.filter((sub) => {
    const daysUntilBilling = Math.ceil(
      (new Date(sub.nextBillingDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    )
    return daysUntilBilling <= 7
  }).length

  const stats = [
    {
      label: 'アクティブなサブスク',
      value: activeSubscriptions.length,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: '月額合計',
      value: `¥${Math.round(monthlyTotal).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: '年間予測',
      value: `¥${Math.round(yearlyTotal).toLocaleString()}`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: '今週の支払い',
      value: upcomingPayments,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
