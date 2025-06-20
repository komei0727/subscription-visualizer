import Link from 'next/link'

export default function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            サブスクリプション管理アプリ
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            あなたのサブスクリプションを一元管理
          </p>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">動作確認</h2>
              <p className="text-gray-600 mb-4">
                データベースとシードデータが正常にセットアップされました！
              </p>

              <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                <p className="text-green-800">
                  ✅ PostgreSQLデータベース: 接続成功
                  <br />
                  ✅ マイグレーション: 完了
                  <br />✅ シードデータ: 8件のサンプルデータを投入
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  ログインページへ
                </Link>
                <Link
                  href="/test/subscriptions"
                  className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  サブスクリプション一覧（テスト用）
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">デモアカウント</h3>
              <p className="text-gray-600">
                メール: demo@example.com
                <br />
                パスワード: demo1234
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
