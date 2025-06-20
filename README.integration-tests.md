# Integration Tests

このプロジェクトでは、APIエンドポイントとデータフローの統合テストを実装しています。

## テスト環境のセットアップ

### 方法1: Docker を使用（推奨）

DockerでPostgreSQLコンテナを起動してテストを実行します：

```bash
# Dockerでテストを実行
pnpm test:integration:docker
```

このコマンドは以下を自動的に実行します：
1. PostgreSQLコンテナの起動
2. テストデータベースのセットアップ
3. 統合テストの実行
4. コンテナのクリーンアップ

### 方法2: ローカルのPostgreSQLを使用

既にPostgreSQLがインストールされている場合：

```bash
# .env.testファイルを作成
cp .env.test.example .env.test

# 環境変数を読み込んでテストを実行
source .env.test && pnpm test:integration
```

### 方法3: モックを使用（データベース不要）

データベースが利用できない環境では：

```bash
pnpm test:integration:mock
```

## テストの構成

### ディレクトリ構造

```
tests/integration/
├── api/                    # APIエンドポイントのテスト
│   ├── subscriptions.test.ts
│   └── error-handling.test.ts
├── flows/                  # データフローのテスト
│   ├── subscription-lifecycle.test.ts
│   └── auth-flow.test.ts
├── utils/                  # テストユーティリティ
│   ├── test-db.ts         # データベース設定
│   ├── test-factories.ts   # テストデータ生成
│   └── test-request.ts     # リクエストヘルパー
└── setup.ts               # テストセットアップ
```

### テストカバレッジ

統合テストは以下をカバーしています：

1. **APIエンドポイント**
   - CRUD操作（作成、読取、更新、削除）
   - エラーハンドリング
   - バリデーション
   - 並行処理

2. **認証フロー**
   - アクセス制御
   - ユーザー間のデータ分離
   - セッション管理

3. **ビジネスロジック**
   - サブスクリプションのライフサイクル
   - ステータス遷移
   - 支払い追跡
   - リマインダー機能

## CI/CD

GitHub Actionsで自動的に統合テストが実行されます：
- プルリクエスト時
- mainブランチへのプッシュ時

## トラブルシューティング

### Dockerが起動しない場合

```bash
# Dockerサービスが実行中か確認
docker ps

# 既存のコンテナをクリーンアップ
docker-compose -f docker-compose.test.yml down -v
```

### ポートの競合

テスト用PostgreSQLはポート5433を使用します。競合する場合は`docker-compose.test.yml`でポートを変更してください。

### テストデータベースのリセット

```bash
# Dockerコンテナをリセット
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d
```