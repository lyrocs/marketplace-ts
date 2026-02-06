'use client'

import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { useAdminGuard } from '@/hooks/use-auth-guard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAdminGuard()
  if (loading) return null

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
