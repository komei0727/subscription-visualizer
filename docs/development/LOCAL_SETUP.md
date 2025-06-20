# ローカル環境セットアップガイド

## 前提条件

- Node.js 18以上
- Docker Desktop（PostgreSQL用）
- pnpm

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/subscription-visualizer.git
cd subscription-visualizer
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. データベースの起動

```bash
# Docker Composeでローカルデータベースを起動
docker-compose up -d

# データベースの起動確認
docker-compose ps
```

### 4. 環境変数の設定

`.env.local`ファイルは既に設定済みです。必要に応じて以下を編集してください：

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/subscription_visualizer"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
```

### 5. データベースマイグレーション

```bash
# Prismaクライアントの生成
pnpm prisma generate

# マイグレーションの実行
pnpm prisma migrate dev --name init

# マイグレーションの確認
pnpm prisma migrate status
```

### 6. シードデータの投入

```bash
# デモデータの投入
pnpm db:seed

# データベースの確認（オプション）
pnpm prisma studio
```

### 7. 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

## デモアカウント

シードデータで作成されるデモアカウント：

- **メールアドレス**: demo@example.com
- **パスワード**: demo1234

## 主な機能の確認

1. **ログイン**
   - デモアカウントでログイン
   - 新規アカウント登録も可能

2. **ダッシュボード**
   - サブスクリプションの概要表示
   - 月次・年次支出の確認
   - 今後の支払い予定

3. **サブスクリプション管理**
   - 登録済みサービスの一覧
   - 新規サブスクリプションの追加
   - 既存サブスクリプションの編集・削除

4. **分析機能**
   - 支出トレンドの確認
   - カテゴリ別の内訳
   - 月次レポート

## トラブルシューティング

### データベース接続エラー

```bash
# Dockerコンテナの状態確認
docker-compose ps

# ログの確認
docker-compose logs postgres

# コンテナの再起動
docker-compose restart postgres
```

### マイグレーションエラー

```bash
# データベースのリセット（開発環境のみ）
pnpm prisma migrate reset

# 再度マイグレーション実行
pnpm prisma migrate dev
```

### ポート競合

PostgreSQLのポート（5432）が使用中の場合：

1. `docker-compose.yml`のポート設定を変更
2. `.env.local`のDATABASE_URLを更新

## データベース管理

### Prisma Studio（GUIツール）

```bash
pnpm prisma studio
```

ブラウザで http://localhost:5555 にアクセス

### データベースのリセット

```bash
# 全データを削除して再作成（注意：全データが失われます）
pnpm prisma migrate reset
```

### バックアップ

```bash
# データベースのバックアップ
docker exec subscription-visualizer-db pg_dump -U postgres subscription_visualizer > backup.sql

# リストア
docker exec -i subscription-visualizer-db psql -U postgres subscription_visualizer < backup.sql
```

## 開発用コマンド

```bash
# 型チェック
pnpm typecheck

# リント
pnpm lint

# フォーマット
pnpm format

# テスト（実装後）
pnpm test
```

## 停止方法

```bash
# 開発サーバーの停止
Ctrl + C

# データベースの停止
docker-compose down

# データベースの停止とデータ削除
docker-compose down -v
```