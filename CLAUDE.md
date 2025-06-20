# Subscription Visualizer

## プロジェクト概要
個人のサブスクリプションサービスを管理・可視化するWebアプリケーション。ユーザーが契約している各種サブスクリプションの支払い情報、更新日、利用状況を一元管理し、支出の最適化を支援する。

## ゴール
- サブスクリプション契約の可視化と管理
- 月次・年次支出の分析とレポート機能
- 解約忘れ防止のためのアラート機能
- 支出削減の提案機能

## 技術スタック
### フロントエンド
- フレームワーク: Next.js 14.x (App Router)
- 言語: TypeScript 5.x
- UI フレームワーク: Tailwind CSS 3.x
- UI コンポーネント: shadcn/ui
- アイコン: Lucide React

### バックエンド・API
- API: Next.js API Routes (REST)
- データベース: PostgreSQL
- ORM: Prisma
- 認証: NextAuth.js v5

### 開発環境
- Node.js: 18.x LTS
- パッケージマネージャー: pnpm
- リンター: ESLint
- フォーマッター: Prettier
- テスト: Jest + React Testing Library

## アーキテクチャパターン
- **ディレクトリ構成**: Next.js App Router準拠
- **コンポーネント設計**: Atomic Design原則
- **API設計**: RESTful API (Next.js API Routes)
- **データベース**: Prismaを使用したスキーマファースト設計

## 開発ガイドライン
### コード規約
- ESLint + Prettier使用
- 関数型コンポーネント推奨
- TypeScript strict mode有効
- コンポーネント名はPascalCase
- ファイル名はkebab-case

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

### コミット規約
Conventional Commitsに準拠:
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント
- `style:` フォーマット
- `refactor:` リファクタリング
- `test:` テスト追加・修正

## テスト戦略
### ユニットテスト
- コンポーネント: React Testing Library
- ユーティリティ関数: Jest
- カバレッジ目標: 80%以上

### 統合テスト
- API Routes: Jest + Supertest
- データベース操作: Prisma Test Environment

### E2Eテスト
- 後日実装予定（Playwright使用予定）
- 主要なユーザーフローをカバー予定

### テスト実行コマンド
```bash
pnpm test:unit         # ユニットテスト
pnpm test:integration  # 統合テスト
pnpm test:all         # すべてのテスト
pnpm test:coverage    # カバレッジレポート
```

## セキュリティ要件
### 認証・認可
- NextAuth.jsによるセッション管理
- CSRF保護有効
- セッションタイムアウト設定

### データ保護
- パスワードハッシュ化（bcrypt）
- 機密データの暗号化
- SQLインジェクション対策（Prisma使用）

### API セキュリティ
- Rate Limiting実装
- CORS設定
- 入力値バリデーション（Zod）

### 環境設定
- 環境変数による機密情報管理
- `.env.local`使用（Gitignore必須）
- 本番環境での適切な環境変数設定
