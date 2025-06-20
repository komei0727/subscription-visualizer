import { auth } from '@/lib/auth-helpers'
import { ProfileSettings } from '@/components/settings/profile-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { SecuritySettings } from '@/components/settings/security-settings'

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>
      
      <div className="space-y-6">
        <ProfileSettings user={session?.user} />
        <NotificationSettings />
        <SecuritySettings />
      </div>
    </div>
  )
}