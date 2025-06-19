# サブスクリプション管理アプリ - プロジェクト構造と初期セットアップ

## プロジェクト構造

```
subscription-visualizer/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認証関連ページ（グループルート）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/              # ダッシュボード（認証必須）
│   │   ├── layout.tsx
│   │   ├── page.tsx              # ダッシュボードトップ
│   │   ├── subscriptions/
│   │   │   ├── page.tsx          # サブスク一覧
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # 新規登録
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 詳細・編集
│   │   │       └── loading.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx          # 分析ページ
│   │   └── settings/
│   │       └── page.tsx          # 設定ページ
│   │
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── subscriptions/
│   │   │   ├── route.ts          # GET(一覧), POST(作成)
│   │   │   └── [id]/
│   │   │       └── route.ts      # GET, PUT, DELETE
│   │   ├── analytics/
│   │   │   ├── summary/
│   │   │   │   └── route.ts
│   │   │   ├── category/
│   │   │   │   └── route.ts
│   │   │   └── trend/
│   │   │       └── route.ts
│   │   └── cron/
│   │       └── billing-reminder/
│   │           └── route.ts
│   │
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # ランディングページ
│   ├── globals.css               # グローバルCSS
│   └── providers.tsx             # Context Providers
│
├── components/                   # 再利用可能なコンポーネント
│   ├── ui/                       # shadcn/ui コンポーネント
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── auth/                     # 認証関連コンポーネント
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── user-menu.tsx
│   │
│   ├── subscriptions/            # サブスクリプション関連
│   │   ├── subscription-card.tsx
│   │   ├── subscription-form.tsx
│   │   ├── subscription-list.tsx
│   │   └── category-filter.tsx
│   │
│   ├── analytics/                # 分析関連
│   │   ├── spending-chart.tsx
│   │   ├── category-breakdown.tsx
│   │   └── trend-graph.tsx
│   │
│   └── layout/                   # レイアウト関連
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── mobile-nav.tsx
│
├── lib/                          # ユーティリティ・設定
│   ├── auth.ts                   # NextAuth設定
│   ├── prisma.ts                 # Prismaクライアント
│   ├── utils.ts                  # ユーティリティ関数
│   ├── constants.ts              # 定数定義
│   ├── validations/              # Zodスキーマ
│   │   ├── auth.ts
│   │   └── subscription.ts
│   └── email/                    # メールテンプレート
│       └── billing-reminder.tsx
│
├── stores/                       # Zustand ストア
│   ├── subscription-store.ts
│   └── user-store.ts
│
├── hooks/                        # カスタムフック
│   ├── use-subscriptions.ts
│   ├── use-analytics.ts
│   └── use-toast.ts
│
├── types/                        # TypeScript型定義
│   ├── index.ts
│   ├── subscription.ts
│   ├── user.ts
│   └── analytics.ts
│
├── prisma/                       # Prisma設定
│   ├── schema.prisma
│   ├── seed.ts                   # シードデータ
│   └── migrations/               # マイグレーション
│
├── public/                       # 静的ファイル
│   ├── images/
│   └── icons/
│
├── tests/                        # テストファイル
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                  # 環境変数サンプル
├── .env.local                    # ローカル環境変数（gitignore）
├── .eslintrc.json               # ESLint設定
├── .gitignore
├── .prettierrc                   # Prettier設定
├── components.json              # shadcn/ui設定
├── middleware.ts                # Next.js Middleware
├── next.config.js               # Next.js設定
├── package.json
├── pnpm-lock.yaml               # pnpmロックファイル
├── postcss.config.js            # PostCSS設定
├── README.md                    # プロジェクト説明
├── tailwind.config.ts           # Tailwind CSS設定
├── tsconfig.json                # TypeScript設定
└── vercel.json                  # Vercel設定
```

## 初期セットアップ手順

### 1. プロジェクトの作成

```bash
# Next.jsプロジェクトの作成
pnpm create next-app@latest subscription-visualizer --typescript --tailwind --app --src-dir=false --import-alias "@/*"

# プロジェクトディレクトリに移動
cd subscription-visualizer
```

### 2. 必要な依存関係のインストール

```bash
# 認証
pnpm add next-auth@beta @auth/prisma-adapter

# データベース・ORM
pnpm add @prisma/client
pnpm add -D prisma

# UI コンポーネント
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-tabs
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# フォーム・バリデーション
pnpm add react-hook-form @hookform/resolvers zod

# 状態管理
pnpm add zustand

# 日付処理
pnpm add date-fns

# グラフ・チャート
pnpm add recharts

# メール送信
pnpm add resend

# 開発用ツール
pnpm add -D @types/node
```

### 3. shadcn/ui の初期化

```bash
# shadcn/ui の初期化
pnpm dlx shadcn-ui@latest init

# 基本コンポーネントの追加
pnpm dlx shadcn-ui@latest add button card dialog form input label select badge tabs toast
```

### 4. Prisma の初期化

```bash
# Prisma初期化
pnpm prisma init

# schema.prismaを編集後、マイグレーション実行
pnpm prisma migrate dev --name init

# Prismaクライアントの生成
pnpm prisma generate
```

### 5. 環境変数の設定

`.env.local` ファイルを作成：

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/subscription_visualizer"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxx"

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 6. 基本的な設定ファイル

#### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

#### middleware.ts
```typescript
export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/subscriptions/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/api/subscriptions/:path*",
    "/api/analytics/:path*",
  ]
}
```

### 7. 開発サーバーの起動

```bash
# 開発サーバー起動
pnpm dev

# 別ターミナルでPrisma Studioを起動（データベース確認用）
pnpm prisma studio
```

## VSCode 推奨設定

`.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

`.vscode/extensions.json`:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## Git設定

`.gitignore`:
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# prisma
prisma/*.db
prisma/*.db-journal
```

## 開発フロー

1. **機能開発時**
   - `feature/機能名` ブランチを作成
   - コンポーネントは `components/` に配置
   - APIエンドポイントは `app/api/` に配置

2. **スタイリング**
   - Tailwind CSSクラスを使用
   - 共通スタイルは `globals.css` に定義
   - shadcn/ui コンポーネントをベースに拡張

3. **型安全性**
   - Zodスキーマで入力検証
   - Prismaの型を活用
   - `types/` に共通型定義

4. **テスト**
   - ユニットテスト: Jest + React Testing Library
   - E2Eテスト: Playwright（後日追加）

この構造により、保守性が高く、拡張しやすいプロジェクトを構築できます。