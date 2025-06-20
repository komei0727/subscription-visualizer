'use client'

import { Subscription } from '@/types/subscription'
import { SubscriptionCard } from './subscription-card'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  readOnly?: boolean
}

export function SubscriptionList({
  subscriptions,
  readOnly = false,
}: SubscriptionListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}
