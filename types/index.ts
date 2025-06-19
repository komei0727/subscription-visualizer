export interface User {
  id: string
  email: string
  name?: string | null
  image?: string | null
}

export interface Subscription {
  id: string
  userId: string
  name: string
  amount: number
  currency: string
  billingCycle: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'CUSTOM'
  nextBillingDate: Date
  category: Category
  isActive: boolean
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export type Category = 
  | 'ENTERTAINMENT'
  | 'PRODUCTIVITY'
  | 'EDUCATION'
  | 'CLOUD_STORAGE'
  | 'MUSIC'
  | 'VIDEO'
  | 'NEWS'
  | 'FINANCE'
  | 'HEALTH'
  | 'OTHER'
