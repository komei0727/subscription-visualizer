import { auth } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await auth()

  // 認証済みユーザーはダッシュボードにリダイレクト
  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">サブスクリプション管理アプリ</h1>
      <p className="mt-4 text-xl text-gray-600">
        あなたのサブスクリプションを一元管理
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          ログイン
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          新規登録
        </Link>
      </div>
    </main>
  )
}
