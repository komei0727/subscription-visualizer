import { auth } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { DashboardSummary } from '@/components/analytics/dashboard-summary'
import { UpcomingPayments } from '@/components/subscriptions/upcoming-payments'
import { CategoryBreakdown } from '@/components/analytics/category-breakdown'

export default async function DashboardPage() {
  const session = await auth()
  
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: session?.user?.id,
      isActive: true,
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
      
      <DashboardSummary subscriptions={subscriptions} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingPayments subscriptions={subscriptions} />
        <CategoryBreakdown subscriptions={subscriptions} />
      </div>
    </div>
  )
}