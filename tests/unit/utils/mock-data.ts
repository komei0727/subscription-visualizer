import { Subscription, BillingCycle, Category } from '@/types/subscription'

export const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    userId: 'test-user-id',
    name: 'Netflix',
    amount: 1980,
    currency: 'JPY',
    billingCycle: BillingCycle.MONTHLY,
    category: Category.ENTERTAINMENT,
    nextBillingDate: new Date('2024-01-15'),
    startDate: new Date('2023-01-15'),
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    description: 'Streaming service',
    isTrial: false,
    notes: 'Premium plan',
  },
  {
    id: '2',
    userId: 'test-user-id',
    name: 'Spotify',
    amount: 980,
    currency: 'JPY',
    billingCycle: BillingCycle.MONTHLY,
    category: Category.ENTERTAINMENT,
    nextBillingDate: new Date('2024-01-20'),
    startDate: new Date('2023-01-20'),
    isActive: true,
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
    description: 'Music streaming',
    isTrial: false,
    notes: null,
  },
]

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  emailVerified: null,
  hashedPassword: 'hashed-password',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
}
