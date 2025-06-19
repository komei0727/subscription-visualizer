import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    })

    let monthlyTotal = 0
    let yearlyTotal = 0
    const categoryBreakdown: Record<string, number> = {}

    subscriptions.forEach(sub => {
      let monthlyAmount = Number(sub.amount)
      
      if (sub.billingCycle === 'YEARLY') {
        monthlyAmount = monthlyAmount / 12
      } else if (sub.billingCycle === 'QUARTERLY') {
        monthlyAmount = monthlyAmount / 3
      }
      
      monthlyTotal += monthlyAmount
      
      if (!categoryBreakdown[sub.category]) {
        categoryBreakdown[sub.category] = 0
      }
      categoryBreakdown[sub.category] += monthlyAmount
    })

    yearlyTotal = monthlyTotal * 12

    return NextResponse.json({
      activeSubscriptions: subscriptions.length,
      monthlyTotal: Math.round(monthlyTotal),
      yearlyTotal: Math.round(yearlyTotal),
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, amount]) => ({
        category,
        amount: Math.round(amount),
      })),
    })
  } catch (error) {
    console.error('GET analytics summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}