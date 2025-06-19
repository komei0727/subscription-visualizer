'use client'

import { Subscription, CATEGORY_LABELS } from '@/types/subscription'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CategoryBreakdownProps {
  subscriptions: Subscription[]
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'
]

export function CategoryBreakdown({ subscriptions }: CategoryBreakdownProps) {
  const activeSubscriptions = subscriptions.filter(s => s.isActive)
  
  const categoryData = activeSubscriptions.reduce((acc, sub) => {
    let monthlyAmount = Number(sub.amount)
    
    if (sub.billingCycle === 'YEARLY') {
      monthlyAmount = monthlyAmount / 12
    } else if (sub.billingCycle === 'QUARTERLY') {
      monthlyAmount = monthlyAmount / 3
    }
    
    const category = sub.category
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += monthlyAmount
    
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(categoryData).map(([category, amount]) => ({
    name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
    value: Math.round(amount),
  }))

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        データがありません
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}