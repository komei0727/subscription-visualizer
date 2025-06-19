'use client'

import { Subscription } from '@/types/subscription'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'

interface TrendGraphProps {
  subscriptions: Subscription[]
}

export function TrendGraph({ subscriptions }: TrendGraphProps) {
  // 過去12ヶ月のデータを生成
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i)
    return {
      month: format(date, 'M月', { locale: ja }),
      activeCount: 0,
      totalAmount: 0,
    }
  })

  // 各月のアクティブなサブスクリプション数と合計金額を計算
  months.forEach((monthData, index) => {
    const monthStart = startOfMonth(subMonths(new Date(), 11 - index))
    const monthEnd = endOfMonth(monthStart)

    subscriptions.forEach(sub => {
      const createdDate = new Date(sub.createdAt)
      
      // その月にアクティブだったかチェック
      if (createdDate <= monthEnd) {
        monthData.activeCount++
        
        let monthlyAmount = Number(sub.amount)
        if (sub.billingCycle === 'YEARLY') {
          monthlyAmount = monthlyAmount / 12
        } else if (sub.billingCycle === 'QUARTERLY') {
          monthlyAmount = monthlyAmount / 3
        }
        
        monthData.totalAmount += Math.round(monthlyAmount)
      }
    })
  })

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={months}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'totalAmount') {
                return [`¥${value.toLocaleString()}`, '合計金額']
              }
              return [value, 'サブスク数']
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="totalAmount"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.6}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="activeCount"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}