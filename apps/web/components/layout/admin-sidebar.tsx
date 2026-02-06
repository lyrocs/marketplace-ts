'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@nextrade/ui'
import { LayoutDashboard, ShoppingBag, Package, Tag, Settings, ChevronRight } from 'lucide-react'

const sidebarItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/deals', label: 'Deals', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/brands', label: 'Brands', icon: Tag },
  { href: '/admin/specs', label: 'Specifications', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-muted/40">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="text-xl font-bold text-primary">NexTrade</Link>
        <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {sidebarItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="border-t p-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to Site</Link>
      </div>
    </aside>
  )
}
