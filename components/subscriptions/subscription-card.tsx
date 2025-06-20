'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Edit, Trash2 } from 'lucide-react'
import { Subscription } from '@/types/subscription'
import { CATEGORY_LABELS, BILLING_CYCLE_LABELS } from '@/types/subscription'
import { cn } from '@/lib/utils'

interface SubscriptionCardProps {
  subscription: Subscription
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const daysUntilBilling = Math.ceil(
    (new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const handleDelete = async () => {
    if (!confirm('このサブスクリプションを削除してもよろしいですか？')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {subscription.name}
            </h3>
            <p className="text-sm text-gray-500">
              {CATEGORY_LABELS[subscription.category]}
            </p>
          </div>
          <div
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              daysUntilBilling <= 7
                ? 'bg-red-100 text-red-800'
                : daysUntilBilling <= 14
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
            )}
          >
            {daysUntilBilling}日後
          </div>
        </div>

        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">
            ¥{Number(subscription.amount).toLocaleString()}
            <span className="text-sm font-normal text-gray-500">
              /{BILLING_CYCLE_LABELS[subscription.billingCycle]}
            </span>
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            次回支払日:{' '}
            {new Date(subscription.nextBillingDate).toLocaleDateString('ja-JP')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/subscriptions/${subscription.id}`)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              aria-label="編集"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {subscription.notes && (
          <p className="mt-3 text-sm text-gray-600 border-t pt-3">
            {subscription.notes}
          </p>
        )}
      </div>
    </div>
  )
}
