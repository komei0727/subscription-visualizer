import { auth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { SpendingChart } from '@/components/analytics/spending-chart'
import { CategoryBreakdown } from '@/components/analytics/category-breakdown'
import { TrendGraph } from '@/components/analytics/trend-graph'

export default async function AnalyticsPage() {
  const session = await auth()
  
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session?.user?.id,
      isActive: true,
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">分析</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">月次支出推移</h2>
          <SpendingChart subscriptions={subscriptions} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">カテゴリ別内訳</h2>
          <CategoryBreakdown subscriptions={subscriptions} />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">支出トレンド</h2>
        <TrendGraph subscriptions={subscriptions} />
      </div>
    </div>
  )
}