import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'

interface Props {
  params: {
    id: string
  }
}

export default async function EditSubscriptionPage({ params }: Props) {
  const session = await auth()
  
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: params.id,
      userId: session?.user?.id,
    },
  })

  if (!subscription) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        サブスクリプションを編集
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <SubscriptionForm subscription={subscription} />
      </div>
    </div>
  )
}