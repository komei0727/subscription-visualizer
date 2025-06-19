'use client'

import { UserMenu } from '@/components/auth/user-menu'
import { MobileNav } from '@/components/layout/mobile-nav'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <MobileNav />
            <h1 className="text-xl font-semibold text-gray-900 ml-4 lg:ml-0">
              サブスクリプション管理
            </h1>
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}