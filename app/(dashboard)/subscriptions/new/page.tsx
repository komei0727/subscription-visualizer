import { SubscriptionForm } from '@/components/subscriptions/subscription-form'

export default function NewSubscriptionPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        新しいサブスクリプションを追加
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <SubscriptionForm />
      </div>
    </div>
  )
}
