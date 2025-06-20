import {
  Subscription as PrismaSubscription,
  BillingCycle,
  Category,
  Payment as PrismaPayment,
  Reminder as PrismaReminder,
  UserCategory as PrismaUserCategory,
  NotificationPreference as PrismaNotificationPreference,
  PaymentStatus,
} from '@prisma/client'

export type Subscription = PrismaSubscription
export type Payment = PrismaPayment
export type Reminder = PrismaReminder
export type UserCategory = PrismaUserCategory
export type NotificationPreference = PrismaNotificationPreference

export { BillingCycle, Category, PaymentStatus }

export interface CreateSubscriptionDto {
  name: string
  description?: string
  amount: number
  currency: string
  billingCycle: BillingCycle
  nextBillingDate: Date
  firstBillingDate?: Date
  category: Category
  isTrial?: boolean
  trialEndDate?: Date
  url?: string
  color?: string
  iconUrl?: string
  notes?: string
  autoRenew?: boolean
  paymentMethod?: string
}

export interface UpdateSubscriptionDto extends Partial<CreateSubscriptionDto> {
  isActive?: boolean
  cancelledAt?: Date
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
  SHOPPING: 'ショッピング・EC',
  GAMING: 'ゲーム',
  SOFTWARE: 'ソフトウェア・ツール',
  COMMUNICATION: 'コミュニケーション',
  TRAVEL: '旅行・移動',
  FOOD: 'フード・デリバリー',
  OTHER: 'その他',
}

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  DAILY: '日',
  WEEKLY: '週',
  MONTHLY: '月',
  QUARTERLY: '四半期',
  SEMI_ANNUAL: '半年',
  YEARLY: '年',
  LIFETIME: '買い切り',
  CUSTOM: 'カスタム',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: '処理中',
  COMPLETED: '完了',
  FAILED: '失敗',
  REFUNDED: '返金済み',
}

// カテゴリ別のデフォルトカラー
export const CATEGORY_COLORS: Record<Category, string> = {
  ENTERTAINMENT: '#FF6B6B',
  PRODUCTIVITY: '#4ECDC4',
  EDUCATION: '#45B7D1',
  CLOUD_STORAGE: '#96CEB4',
  MUSIC: '#DDA0DD',
  VIDEO: '#FFB6C1',
  NEWS: '#F4A460',
  FINANCE: '#98D8C8',
  HEALTH: '#F7DC6F',
  SHOPPING: '#FF9F43',
  GAMING: '#A29BFE',
  SOFTWARE: '#74B9FF',
  COMMUNICATION: '#81ECEC',
  TRAVEL: '#FD79A8',
  FOOD: '#FDCB6E',
  OTHER: '#B2BEC3',
}
