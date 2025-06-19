import { Subscription as PrismaSubscription, BillingCycle, Category } from '@prisma/client'

export type Subscription = PrismaSubscription

export { BillingCycle, Category }

export interface CreateSubscriptionDto {
  name: string
  amount: number
  currency: string
  billingCycle: BillingCycle
  nextBillingDate: Date
  category: Category
  notes?: string
}

export interface UpdateSubscriptionDto extends Partial<CreateSubscriptionDto> {
  isActive?: boolean
}

export const CATEGORY_LABELS: Record<Category, string> = {
  ENTERTAINMENT: 'エンターテインメント',
  PRODUCTIVITY: '生産性・仕事',
  EDUCATION: '教育・学習',
  CLOUD_STORAGE: 'クラウドストレージ',
  MUSIC: '音楽',
  VIDEO: '動画・映像',
  NEWS: 'ニュース・情報',
  FINANCE: '金融・投資',
  HEALTH: '健康・フィットネス',
  OTHER: 'その他',
}

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: '月額',
  YEARLY: '年額',
  QUARTERLY: '四半期',
  CUSTOM: 'カスタム',
}