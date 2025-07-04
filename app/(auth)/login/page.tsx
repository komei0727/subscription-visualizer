import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { isRegistrationDisabled } from '@/lib/auth-helpers'

export default function LoginPage() {
  const registrationDisabled = isRegistrationDisabled()

  return (
    <>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          アカウントにログイン
        </h2>
        {!registrationDisabled && (
          <p className="mt-2 text-center text-sm text-gray-600">
            またはアカウントをお持ちでない方は{' '}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              新規登録
            </Link>
          </p>
        )}
      </div>
      <Suspense fallback={<div>読み込み中...</div>}>
        <LoginForm />
      </Suspense>
    </>
  )
}
