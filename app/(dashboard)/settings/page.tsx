import { auth } from '@/lib/auth-helpers'
import { ProfileSettings } from '@/components/settings/profile-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { SecuritySettings } from '@/components/settings/security-settings'
import { prisma } from '@/lib/prisma'

export default async function SettingsPage() {
  const session = await auth()

  // Fetch the complete user data from database if session exists
  let user = null
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    user = dbUser
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>

      <div className="space-y-6">
        <ProfileSettings user={user} />
        <NotificationSettings />
        <SecuritySettings />
      </div>
    </div>
  )
}
