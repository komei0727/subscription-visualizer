'use client'

import { Subscription, BILLING_CYCLE_LABELS } from '@/types/subscription'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface UpcomingPaymentsProps {
  subscriptions: Subscription[]
}

export function UpcomingPayments({ subscriptions }: UpcomingPaymentsProps) {
  const upcoming = subscriptions
    .filter(s => s.isActive)
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
    .slice(0, 5)

  if (upcoming.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">今後の支払い予定</h2>
        <p className="text-gray-500">支払い予定はありません</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">今後の支払い予定</h2>
      <div className="space-y-4">
        {upcoming.map((subscription) => {
          const daysUntilBilling = Math.ceil(
            (new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
          
          return (
            <div key={subscription.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-900">{subscription.name}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(subscription.nextBillingDate), 'M月d日(E)', { locale: ja })}
                  <span className="ml-2 text-xs">
                    ({daysUntilBilling}日後)
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  ¥{Number(subscription.amount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {BILLING_CYCLE_LABELS[subscription.billingCycle]}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}