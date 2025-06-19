#!/bin/bash

# サブスクリプション管理アプリ - 初期セットアップスクリプト

set -e

echo "🚀 サブスクリプション管理アプリのセットアップを開始します..."

# Node.jsバージョンチェック
required_node_version=18
current_node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$current_node_version" -lt "$required_node_version" ]; then
    echo "❌ Node.js v${required_node_version}以上が必要です。現在: v${current_node_version}"
    exit 1
fi

# pnpmのインストール確認
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpmをインストールしています..."
    npm install -g pnpm
fi

# 依存関係のインストール
echo "📦 依存関係をインストールしています..."
pnpm install

# 環境変数ファイルのセットアップ
if [ ! -f .env.local ]; then
    echo "🔐 環境変数ファイルを作成しています..."
    cp .env.example .env.local
    echo "⚠️  .env.localファイルを編集して、必要な環境変数を設定してください。"
fi

# Prismaのセットアップ
echo "🗄️  Prismaをセットアップしています..."
pnpm prisma generate

# ディレクトリ構造の作成
echo "📁 プロジェクト構造を作成しています..."

directories=(
    "app/(auth)/login"
    "app/(auth)/register"
    "app/(dashboard)/subscriptions/new"
    "app/(dashboard)/subscriptions/[id]"
    "app/(dashboard)/analytics"
    "app/(dashboard)/settings"
    "app/api/auth/[...nextauth]"
    "app/api/subscriptions/[id]"
    "app/api/analytics/summary"
    "app/api/analytics/category"
    "app/api/analytics/trend"
    "app/api/cron/billing-reminder"
    "components/ui"
    "components/auth"
    "components/subscriptions"
    "components/analytics"
    "components/layout"
    "lib/validations"
    "lib/email"
    "stores"
    "hooks"
    "types"
    "prisma/migrations"
    "public/images"
    "public/icons"
    "tests/unit"
    "tests/integration"
    "tests/e2e"
)

for dir in "${directories[@]}"; do
    mkdir -p "$dir"
done

# 基本的なファイルを作成
echo "📄 基本ファイルを作成しています..."

# app/layout.tsx
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'サブスクリプション管理',
  description: 'あなたのサブスクリプションを一元管理',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF

# app/page.tsx
cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">サブスクリプション管理アプリ</h1>
      <p className="mt-4 text-xl text-gray-600">
        あなたのサブスクリプションを一元管理
      </p>
    </main>
  )
}
EOF

# app/globals.css
cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOF

# lib/utils.ts
cat > lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

# types/index.ts
cat > types/index.ts << 'EOF'
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
EOF

echo "✅ 基本的なセットアップが完了しました！"
echo ""
echo "次のステップ:"
echo "1. .env.localファイルを編集して環境変数を設定"
echo "2. データベースをセットアップ（PostgreSQL）"
echo "3. pnpm prisma migrate dev でマイグレーションを実行"
echo "4. pnpm dev で開発サーバーを起動"
echo ""
echo "Happy coding! 🎉"