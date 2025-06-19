'use client'

import { useState } from 'react'

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [reminderDays, setReminderDays] = useState(7)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">通知設定</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">メール通知</p>
            <p className="text-sm text-gray-500">支払い期日の前にメールで通知を受け取る</p>
          </div>
          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div>
          <label htmlFor="reminder-days" className="block text-sm font-medium text-gray-700">
            リマインダー日数
          </label>
          <select
            id="reminder-days"
            value={reminderDays}
            onChange={(e) => setReminderDays(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value={1}>1日前</option>
            <option value={3}>3日前</option>
            <option value={7}>7日前</option>
            <option value={14}>14日前</option>
          </select>
        </div>
      </div>
    </div>
  )
}