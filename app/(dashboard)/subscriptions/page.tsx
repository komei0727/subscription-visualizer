import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { SubscriptionList } from '@/components/subscriptions/subscription-list'

export default async function SubscriptionsPage() {
  const session = await auth()
  
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session?.user?.id,
    },
    orderBy: {
      nextBillingDate: 'asc',
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">サブスクリプション</h1>
        <Link
          href="/dashboard/subscriptions/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新規追加
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">まだサブスクリプションが登録されていません</p>
          <Link
            href="/dashboard/subscriptions/new"
            className="inline-block mt-4 text-indigo-600 hover:text-indigo-500"
          >
            最初のサブスクリプションを追加
          </Link>
        </div>
      ) : (
        <SubscriptionList subscriptions={subscriptions} />
      )}
    </div>
  )
}