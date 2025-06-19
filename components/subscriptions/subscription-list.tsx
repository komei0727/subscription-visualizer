'use client'

import { Subscription } from '@/types/subscription'
import { SubscriptionCard } from './subscription-card'

interface SubscriptionListProps {
  subscriptions: Subscription[]
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subscriptions.map((subscription) => (
        <SubscriptionCard key={subscription.id} subscription={subscription} />
      ))}
    </div>
  )
}