'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Subscription, BillingCycle, Category, CATEGORY_LABELS, BILLING_CYCLE_LABELS } from '@/types/subscription'
import { SubscriptionFormData, subscriptionSchema } from '@/lib/validations/subscription'

interface SubscriptionFormProps {
  subscription?: Subscription
}

export function SubscriptionForm({ subscription }: SubscriptionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: subscription ? {
      name: subscription.name,
      amount: Number(subscription.amount),
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      nextBillingDate: new Date(subscription.nextBillingDate),
      category: subscription.category,
      notes: subscription.notes || undefined,
    } : {
      currency: 'JPY',
      billingCycle: BillingCycle.MONTHLY,
    },
  })

  const onSubmit = async (data: SubscriptionFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = subscription 
        ? `/api/subscriptions/${subscription.id}`
        : '/api/subscriptions'
      
      const method = subscription ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription')
      }

      router.push('/dashboard/subscriptions')
      router.refresh()
    } catch (error) {
      setError('保存中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          サービス名
        </label>
        <input
          {...register('name')}
          type="text"
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            金額
          </label>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            id="amount"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="billingCycle" className="block text-sm font-medium text-gray-700">
            支払いサイクル
          </label>
          <select
            {...register('billingCycle')}
            id="billingCycle"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {Object.entries(BILLING_CYCLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.billingCycle && (
            <p className="mt-1 text-sm text-red-600">{errors.billingCycle.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="nextBillingDate" className="block text-sm font-medium text-gray-700">
            次回支払日
          </label>
          <input
            {...register('nextBillingDate', {
              valueAsDate: true,
            })}
            type="date"
            id="nextBillingDate"
            min={format(new Date(), 'yyyy-MM-dd')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.nextBillingDate && (
            <p className="mt-1 text-sm text-red-600">{errors.nextBillingDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            カテゴリ
          </label>
          <select
            {...register('category')}
            id="category"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          メモ（任意）
        </label>
        <textarea
          {...register('notes')}
          id="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? '保存中...' : subscription ? '更新' : '追加'}
        </button>
      </div>
    </form>
  )
}