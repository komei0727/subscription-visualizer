import { prisma } from '@/lib/prisma'
import { formatAmount, calculateMonthlyAmount } from '@/lib/utils/subscription'
import { CATEGORY_LABELS, BILLING_CYCLE_LABELS } from '@/types/subscription'
import Link from 'next/link'

export default async function TestSubscriptionsPage() {
  // デモユーザーのサブスクリプションを取得
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@example.com' },
  })

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: demoUser?.id,
    },
    orderBy: {
      nextBillingDate: 'asc',
    },
  })

  const monthlyTotal = subscriptions
    .filter(s => s.isActive)
    .reduce((total, sub) => {
      return total + calculateMonthlyAmount(Number(sub.amount), sub.billingCycle)
    }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-500"
          >
            ← ホームに戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          サブスクリプション一覧（テスト用）
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">月額合計</h2>
          <p className="text-3xl font-bold text-indigo-600">
            ¥{Math.round(monthlyTotal).toLocaleString()}
          </p>
          <p className="text-gray-600">
            年間予測: ¥{Math.round(monthlyTotal * 12).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => {
            const daysUntilBilling = Math.ceil(
              (new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <div key={subscription.id} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {subscription.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {CATEGORY_LABELS[subscription.category]}
                  </p>
                  {subscription.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {subscription.description}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(Number(subscription.amount), subscription.currency)}
                    <span className="text-sm font-normal text-gray-500">
                      /{BILLING_CYCLE_LABELS[subscription.billingCycle]}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">次回支払日:</span>{' '}
                    {new Date(subscription.nextBillingDate).toLocaleDateString('ja-JP')}
                    <span className={`ml-2 font-semibold ${
                      daysUntilBilling <= 7 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ({daysUntilBilling}日後)
                    </span>
                  </p>
                  
                  <p>
                    <span className="text-gray-500">ステータス:</span>{' '}
                    <span className={`font-semibold ${
                      subscription.isActive ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {subscription.isActive ? 'アクティブ' : '解約済み'}
                    </span>
                  </p>

                  {subscription.isTrial && (
                    <p>
                      <span className="text-gray-500">トライアル:</span>{' '}
                      <span className="font-semibold text-orange-600">
                        無料トライアル中
                      </span>
                    </p>
                  )}

                  {subscription.notes && (
                    <p className="text-gray-600 border-t pt-2 mt-2">
                      {subscription.notes}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}