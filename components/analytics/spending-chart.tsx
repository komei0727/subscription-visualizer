'use client'

import { Subscription } from '@/types/subscription'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { subMonths, format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface SpendingChartProps {
  subscriptions: Subscription[]
}

export function SpendingChart({ subscriptions }: SpendingChartProps) {
  // 過去6ヶ月のデータを生成
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    return {
      month: format(date, 'yyyy年M月', { locale: ja }),
      amount: 0,
    }
  })

  // 現在アクティブなサブスクリプションの月額を計算
  subscriptions.filter(s => s.isActive).forEach(sub => {
    let monthlyAmount = Number(sub.amount)
    
    if (sub.billingCycle === 'YEARLY') {
      monthlyAmount = monthlyAmount / 12
    } else if (sub.billingCycle === 'QUARTERLY') {
      monthlyAmount = monthlyAmount / 3
    }

    // 作成日以降の月にのみ金額を追加
    const createdDate = new Date(sub.createdAt)
    months.forEach(monthData => {
      const monthDate = new Date(monthData.month)
      if (monthDate >= createdDate) {
        monthData.amount += Math.round(monthlyAmount)
      }
    })
  })

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={months}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
          <Line 
            type="monotone" 
            dataKey="amount" 
            stroke="#4F46E5" 
            strokeWidth={2}
            dot={{ fill: '#4F46E5' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}