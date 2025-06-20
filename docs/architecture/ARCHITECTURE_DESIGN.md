# サブスクリプション可視化アプリ - シンプルアーキテクチャ設計（Bobby型）

## 1. 設計方針

### 1.1 基本原則

Bobby型のシンプルなサブスクリプショントラッカーとして、以下の原則で設計：

- **シンプリシティファースト**: 複雑な機能は避け、コア機能に集中
- **モノリシックアーキテクチャ**: 管理・開発の簡素化
- **手動入力中心**: 自動連携機能は実装しない
- **低コスト運用**: 最小限のインフラストラクチャ

### 1.2 MVP機能

1. ユーザー登録・ログイン
2. サブスクリプションの手動登録・編集・削除
3. 月次支出の可視化
4. 支払い期日の通知
5. カテゴリ別の支出表示

## 2. 技術スタック

### 2.1 選定理由

- **開発効率**: フルスタックTypeScriptで統一
- **デプロイ簡易性**: Vercelへのワンクリックデプロイ
- **コスト効率**: サーバーレス実行で従量課金

### 2.2 具体的な技術

```
フロントエンド:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - React Hook Form + Zod

バックエンド:
  - Next.js API Routes
  - Prisma ORM
  - NextAuth.js v5

データベース:
  - PostgreSQL (Supabase or Neon)

インフラ:
  - Vercel (ホスティング)
  - Resend (メール送信)
  - Uploadthing (画像アップロード)
```

## 3. アーキテクチャ概要

### 3.1 シンプルな3層構造

```
┌─────────────────────────────────────┐
│     クライアント (Next.js App)      │
│  - React Components                 │
│  - Client-side State (Zustand)     │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│      API層 (Next.js API Routes)     │
│  - RESTful Endpoints               │
│  - Authentication (NextAuth)        │
│  - Validation (Zod)                │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│     データ層 (PostgreSQL)           │
│  - Prisma ORM                      │
│  - Database Migrations             │
└─────────────────────────────────────┘
```

## 4. データベース設計

### 4.1 最小限のテーブル構成

```prisma
// schema.prisma

model User {
  id              String          @id @default(cuid())
  email           String          @unique
  name            String?
  emailVerified   DateTime?
  image           String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  accounts        Account[]
  sessions        Session[]
  subscriptions   Subscription[]
}

model Subscription {
  id              String          @id @default(cuid())
  userId          String
  name            String
  amount          Decimal         @db.Decimal(10, 2)
  currency        String          @default("JPY")
  billingCycle    BillingCycle    @default(MONTHLY)
  nextBillingDate DateTime
  category        Category
  isActive        Boolean         @default(true)
  notes           String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([nextBillingDate])
}

enum BillingCycle {
  MONTHLY
  YEARLY
  QUARTERLY
  CUSTOM
}

enum Category {
  ENTERTAINMENT
  PRODUCTIVITY
  EDUCATION
  CLOUD_STORAGE
  MUSIC
  VIDEO
  NEWS
  FINANCE
  HEALTH
  OTHER
}

// NextAuth.js用のテーブル
model Account {
  // NextAuth標準スキーマ
}

model Session {
  // NextAuth標準スキーマ
}
```

## 5. API設計

### 5.1 RESTful エンドポイント

```typescript
// Subscription CRUD
GET    /api/subscriptions          // 一覧取得
POST   /api/subscriptions          // 新規作成
PUT    /api/subscriptions/:id      // 更新
DELETE /api/subscriptions/:id      // 削除

// Analytics
GET    /api/analytics/summary      // 支出サマリー
GET    /api/analytics/category     // カテゴリ別分析
GET    /api/analytics/trend        // トレンド分析

// User
GET    /api/user/profile          // プロフィール取得
PUT    /api/user/profile          // プロフィール更新
DELETE /api/user/account          // アカウント削除
```

### 5.2 API実装例

```typescript
// app/api/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const subscriptionSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('JPY'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY', 'QUARTERLY', 'CUSTOM']),
  nextBillingDate: z.string().datetime(),
  category: z.enum(['ENTERTAINMENT', 'PRODUCTIVITY' /* ... */]),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = subscriptionSchema.parse(body)

    const subscription = await prisma.subscription.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

## 6. フロントエンド設計

### 6.1 ページ構成

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── page.tsx              # ダッシュボード
│   ├── subscriptions/
│   │   ├── page.tsx          # 一覧
│   │   └── [id]/
│   │       └── page.tsx      # 詳細・編集
│   ├── analytics/
│   │   └── page.tsx          # 分析
│   └── settings/
│       └── page.tsx          # 設定
└── api/
    └── ...                   # API Routes
```

### 6.2 コンポーネント構成

```typescript
// components/subscription-card.tsx
interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubscriptionCard({ subscription, onEdit, onDelete }: SubscriptionCardProps) {
  const daysUntilBilling = differenceInDays(
    new Date(subscription.nextBillingDate),
    new Date()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{subscription.name}</h3>
            <p className="text-sm text-muted-foreground">
              {CATEGORY_LABELS[subscription.category]}
            </p>
          </div>
          <Badge variant={daysUntilBilling <= 7 ? "destructive" : "secondary"}>
            {daysUntilBilling}日後
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          ¥{subscription.amount.toLocaleString()}
          <span className="text-sm font-normal text-muted-foreground">
            /{BILLING_CYCLE_LABELS[subscription.billingCycle]}
          </span>
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          編集
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}>
          削除
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## 7. 状態管理

### 7.1 Zustandによるクライアント状態管理

```typescript
// stores/subscription-store.ts
import { create } from 'zustand'

interface SubscriptionStore {
  subscriptions: Subscription[]
  isLoading: boolean
  fetchSubscriptions: () => Promise<void>
  addSubscription: (data: CreateSubscriptionDto) => Promise<void>
  updateSubscription: (id: string, data: UpdateSubscriptionDto) => Promise<void>
  deleteSubscription: (id: string) => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: [],
  isLoading: false,

  fetchSubscriptions: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/subscriptions')
      const data = await res.json()
      set({ subscriptions: data })
    } finally {
      set({ isLoading: false })
    }
  },
  // ... 他のメソッド
}))
```

## 8. 通知機能

### 8.1 シンプルなメール通知

```typescript
// lib/notifications.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBillingReminder(
  user: User,
  subscription: Subscription
) {
  await resend.emails.send({
    from: 'noreply@subscription-visualizer.com',
    to: user.email,
    subject: `${subscription.name}の支払い期日が近づいています`,
    html: `
      <p>${user.name}様</p>
      <p>${subscription.name}の次回支払い日は${formatDate(subscription.nextBillingDate)}です。</p>
      <p>金額: ¥${subscription.amount.toLocaleString()}</p>
    `,
  })
}

// Vercel Cronジョブで毎日実行
export async function checkUpcomingBillings() {
  const tomorrow = addDays(new Date(), 1)
  const weekLater = addDays(new Date(), 7)

  const subscriptions = await prisma.subscription.findMany({
    where: {
      nextBillingDate: {
        gte: tomorrow,
        lte: weekLater,
      },
      isActive: true,
    },
    include: {
      user: true,
    },
  })

  for (const subscription of subscriptions) {
    await sendBillingReminder(subscription.user, subscription)
  }
}
```

## 9. デプロイメント

### 9.1 環境変数

```env
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
RESEND_API_KEY="..."
```

### 9.2 Vercelデプロイ設定

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/billing-reminder",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## 10. セキュリティ

### 10.1 基本的なセキュリティ対策

- **認証**: NextAuth.jsによるセッション管理
- **認可**: API Routeでのセッション確認
- **入力検証**: Zodによるスキーマ検証
- **CSRF保護**: NextAuth.js標準機能
- **SQLインジェクション対策**: Prisma ORM使用

### 10.2 データ保護

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/subscriptions/:path*',
    '/api/analytics/:path*',
  ],
}
```

## 11. 今後の拡張計画

### Phase 1 (MVP)

- [x] 基本的なCRUD機能
- [x] シンプルな分析機能
- [x] メール通知

### Phase 2

- [ ] CSVインポート/エクスポート
- [ ] より詳細な分析機能
- [ ] 複数通貨対応

### Phase 3

- [ ] モバイルアプリ（React Native）
- [ ] 家族共有機能
- [ ] APIの公開

このアーキテクチャにより、Bobby型のシンプルで使いやすいサブスクリプショントラッカーを、低コストで迅速に開発・運用することが可能です。
