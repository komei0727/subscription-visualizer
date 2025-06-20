import { PrismaClient, BillingCycle, Category } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // デモユーザーの作成
  const hashedPassword = await hash('demo1234', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'デモユーザー',
      hashedPassword,
      emailVerified: new Date(),
    },
  })

  console.log('Created demo user:', user.email)

  // 通知設定の作成
  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      emailEnabled: true,
      reminderDays: 7,
      weeklyReport: false,
      monthlyReport: true,
      priceChangeAlert: true,
    },
  })

  // サンプルサブスクリプションの作成
  const subscriptions = [
    {
      name: 'Netflix',
      description: '動画ストリーミングサービス',
      amount: 1490,
      currency: 'JPY',
      billingCycle: BillingCycle.MONTHLY,
      category: Category.VIDEO,
      nextBillingDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10日後
      firstBillingDate: new Date('2023-01-15'),
      url: 'https://www.netflix.com',
      color: '#E50914',
      isActive: true,
      autoRenew: true,
    },
    {
      name: 'Spotify',
      description: '音楽ストリーミングサービス',
      amount: 980,
      currency: 'JPY',
      billingCycle: BillingCycle.MONTHLY,
      category: Category.MUSIC,
      nextBillingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5日後
      firstBillingDate: new Date('2022-06-01'),
      url: 'https://www.spotify.com',
      color: '#1DB954',
      isActive: true,
      autoRenew: true,
    },
    {
      name: 'Adobe Creative Cloud',
      description: 'クリエイティブツールスイート',
      amount: 6480,
      currency: 'JPY',
      billingCycle: BillingCycle.MONTHLY,
      category: Category.SOFTWARE,
      nextBillingDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20日後
      firstBillingDate: new Date('2023-03-01'),
      url: 'https://www.adobe.com',
      color: '#FF0000',
      isActive: true,
      autoRenew: true,
    },
    {
      name: 'Notion',
      description: 'オールインワン生産性ツール',
      amount: 0,
      currency: 'JPY',
      billingCycle: BillingCycle.MONTHLY,
      category: Category.PRODUCTIVITY,
      nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      firstBillingDate: new Date('2023-08-01'),
      url: 'https://www.notion.so',
      isActive: true,
      autoRenew: true,
      isTrial: true,
      trialEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      notes: '無料プランを利用中',
    },
    {
      name: 'Amazon Prime',
      description: '配送特典と動画サービス',
      amount: 5900,
      currency: 'JPY',
      billingCycle: BillingCycle.YEARLY,
      category: Category.SHOPPING,
      nextBillingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180日後
      firstBillingDate: new Date('2023-02-20'),
      url: 'https://www.amazon.co.jp',
      color: '#FF9900',
      isActive: true,
      autoRenew: true,
    },
    {
      name: 'ChatGPT Plus',
      description: 'AI アシスタント',
      amount: 20,
      currency: 'USD',
      billingCycle: BillingCycle.MONTHLY,
      category: Category.PRODUCTIVITY,
      nextBillingDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      firstBillingDate: new Date('2023-11-01'),
      url: 'https://chat.openai.com',
      color: '#00A67E',
      isActive: true,
      autoRenew: true,
    },
    {
      name: 'iCloud+',
      description: 'クラウドストレージ',
      amount: 130,
      currency: 'JPY',
      billingCycle: BillingCycle.MONTHLY,
      category: Category.CLOUD_STORAGE,
      nextBillingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      firstBillingDate: new Date('2022-01-01'),
      url: 'https://www.icloud.com',
      isActive: true,
      autoRenew: true,
    },
    {
      name: 'YouTube Premium',
      description: '広告なし動画視聴',
      amount: 1180,
      currency: 'JPY',
      billingCycle: BillingCycle.MONTHLY,
      category: Category.VIDEO,
      nextBillingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3日後
      firstBillingDate: new Date('2023-05-10'),
      url: 'https://www.youtube.com',
      color: '#FF0000',
      isActive: false,
      autoRenew: false,
      cancelledAt: new Date('2024-01-15'),
      notes: '利用頻度が低いため解約',
    },
  ]

  // サブスクリプションとリマインダーの作成
  for (const sub of subscriptions) {
    const subscription = await prisma.subscription.create({
      data: {
        ...sub,
        userId: user.id,
      },
    })

    // アクティブなサブスクリプションにリマインダーを設定
    if (subscription.isActive) {
      await prisma.reminder.create({
        data: {
          subscriptionId: subscription.id,
          daysBefore: 7,
          isEnabled: true,
        },
      })

      // 支払い履歴を作成（過去3ヶ月分）
      const payments = []
      for (let i = 1; i <= 3; i++) {
        const paidAt = new Date(subscription.nextBillingDate)
        paidAt.setMonth(paidAt.getMonth() - i)

        payments.push({
          subscriptionId: subscription.id,
          amount: subscription.amount,
          currency: subscription.currency,
          paidAt,
          paymentMethod: 'クレジットカード',
          status: 'COMPLETED' as const,
        })
      }

      await prisma.payment.createMany({
        data: payments,
      })
    }

    console.log('Created subscription:', subscription.name)
  }

  console.log('Seed data created successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
