# サブスクリプション管理アプリ

個人のサブスクリプションサービスを管理・可視化するWebアプリケーション。Bobby型のシンプルなトラッカーとして、使いやすさを重視した設計になっています。

## 🚀 機能

- 📊 サブスクリプションの一元管理
- 💰 月次・年次支出の可視化
- 📅 支払い期日の通知
- 📈 カテゴリ別の支出分析
- 🔐 セキュアなユーザー認証

## 🛠 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL + Prisma ORM
- **認証**: NextAuth.js v5
- **状態管理**: Zustand
- **ホスティング**: Vercel

## 📋 必要な環境

- Node.js 18.x以上
- pnpm 8.x以上
- PostgreSQL 14.x以上

## 🏃‍♂️ クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/subscription-visualizer.git
cd subscription-visualizer
```

### 2. 自動セットアップ（推奨）

```bash
./setup.sh
```

### 3. 手動セットアップ

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local
# .env.localを編集して必要な値を設定

# データベースのマイグレーション
pnpm prisma migrate dev

# 開発サーバーの起動
pnpm dev
```

## 🔧 環境変数

`.env.local`ファイルに以下の環境変数を設定してください：

```env
# データベース接続
DATABASE_URL="postgresql://user:password@localhost:5432/subscription_visualizer"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# メール送信（Resend）
RESEND_API_KEY="re_xxxxxxxxxx"
```

## 📂 プロジェクト構造

```
subscription-visualizer/
├── app/                    # Next.js App Router
├── components/             # Reactコンポーネント
├── lib/                    # ユーティリティ関数
├── prisma/                 # データベーススキーマ
├── public/                 # 静的ファイル
├── stores/                 # Zustand ストア
├── types/                  # TypeScript型定義
└── tests/                  # テストファイル
```

## 🧪 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# プロダクション起動
pnpm start

# リント実行
pnpm lint

# フォーマット実行
pnpm format

# 型チェック
pnpm typecheck

# データベース管理
pnpm db:migrate     # マイグレーション実行
pnpm db:studio      # Prisma Studio起動
pnpm db:seed        # シードデータ投入
pnpm db:reset       # データベースリセット
```

## 🚀 デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)でアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ

詳細は[Vercelのドキュメント](https://vercel.com/docs)を参照してください。

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストを歓迎します！大きな変更を行う場合は、まずissueを作成して変更内容について議論してください。

## 📧 サポート

質問や問題がある場合は、[Issues](https://github.com/yourusername/subscription-visualizer/issues)でお知らせください。
