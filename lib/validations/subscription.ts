import { z } from 'zod'
import { BillingCycle, Category } from '@prisma/client'

export const subscriptionSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内で入力してください'),
  amount: z.number().positive('金額は正の数値を入力してください'),
  currency: z.string().default('JPY'),
  billingCycle: z.nativeEnum(BillingCycle),
  nextBillingDate: z.date(),
  category: z.nativeEnum(Category),
  notes: z.string().max(500, 'メモは500文字以内で入力してください').optional(),
})

export const updateSubscriptionSchema = subscriptionSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>
export type UpdateSubscriptionFormData = z.infer<typeof updateSubscriptionSchema>