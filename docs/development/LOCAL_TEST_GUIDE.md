# ローカル動作確認の手順

データベースのセットアップが完了しました！以下の手順で動作確認ができます。

## 1. 開発サーバーの起動

```bash
pnpm dev
```

## 2. アプリケーションへのアクセス

ブラウザで以下のURLにアクセス：
http://localhost:3000

## 3. デモアカウントでログイン

- **メールアドレス**: `demo@example.com`
- **パスワード**: `demo1234`

## 4. 確認すべき機能

### ダッシュボード

- ✅ サブスクリプションの概要が表示される
- ✅ 月次支出: ¥11,978（8つのアクティブなサービス）
- ✅ 年間予測: ¥143,736
- ✅ 今後の支払い予定が表示される

### サブスクリプション一覧

- ✅ 8つのサンプルサブスクリプションが表示される
  - Netflix（¥1,490/月）
  - Spotify（¥980/月）
  - Adobe Creative Cloud（¥6,480/月）
  - Notion（無料トライアル中）
  - Amazon Prime（¥5,900/年）
  - ChatGPT Plus（$20/月）
  - iCloud+（¥130/月）
  - YouTube Premium（解約済み）

### 新規追加機能

- ✅ 「新規追加」ボタンから新しいサブスクリプションを追加できる
- ✅ 名前、金額、支払いサイクル、カテゴリなどを設定できる

### 編集・削除機能

- ✅ 各サブスクリプションの編集ボタンで情報を更新できる
- ✅ 削除ボタンでサブスクリプションを削除できる

### 分析ページ

- ✅ 月次支出推移のグラフ
- ✅ カテゴリ別の円グラフ
- ✅ 支出トレンドの表示

## 5. データベースの確認（オプション）

Prisma Studioでデータベースの中身を確認：

```bash
pnpm prisma studio
```

ブラウザで http://localhost:5555 にアクセス

## 6. トラブルシューティング

### ログインできない場合

1. データベースが起動しているか確認

   ```bash
   sudo docker compose ps
   ```

2. シードデータが正しく投入されているか確認
   ```bash
   pnpm prisma studio
   ```
   → Userテーブルにdemo@example.comが存在するか確認

### エラーが表示される場合

1. コンソールログを確認
2. `.env`ファイルの設定を確認
3. 開発サーバーを再起動
   ```bash
   # Ctrl+C で停止後
   pnpm dev
   ```

## 動作確認完了！🎉

これで基本的な機能がすべて動作することを確認できました。
Bobby型のシンプルなサブスクリプショントラッカーとして、以下の機能が利用可能です：

- 手動でのサブスクリプション登録
- 支払い期日の管理
- 月次・年次の支出分析
- カテゴリ別の内訳表示
- 支払い履歴の追跡（データモデルに実装済み）
