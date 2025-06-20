import Link from 'next/link'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/components/auth/register-form'
import { isRegistrationDisabled } from '@/lib/auth-helpers'

export default function RegisterPage() {
  // Redirect to login if registration is disabled
  if (isRegistrationDisabled()) {
    redirect('/login')
  }

  return (
    <>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          アカウントを作成
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          またはすでにアカウントをお持ちの方は{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            ログイン
          </Link>
        </p>
      </div>
      <RegisterForm />
    </>
  )
}
