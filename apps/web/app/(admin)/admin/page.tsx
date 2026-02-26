'use client'

import { useQuery } from '@apollo/client/react'
import { ADMIN_DEALS_QUERY } from '@/graphql/queries'
import { Card, CardContent, Skeleton } from '@marketplace/ui'
import { ShoppingBag, Users, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: publishedDeals, loading: l1 } = useQuery(ADMIN_DEALS_QUERY, { variables: { status: 'PUBLISHED', limit: 5 } })
  const { data: draftDeals, loading: l2 } = useQuery(ADMIN_DEALS_QUERY, { variables: { status: 'DRAFT', limit: 5 } })
  const { data: declinedDeals, loading: l3 } = useQuery(ADMIN_DEALS_QUERY, { variables: { status: 'DECLINED', limit: 5 } })
  const { data: soldDeals, loading: l4 } = useQuery(ADMIN_DEALS_QUERY, { variables: { status: 'SOLD', limit: 5 } })

  const stats = [
    { label: 'Published Deals', value: (publishedDeals as any)?.adminDeals?.meta?.total || 0, icon: ShoppingBag, color: 'text-blue-600', href: '/admin/deals?status=PUBLISHED' },
    { label: 'Draft Deals', value: (draftDeals as any)?.adminDeals?.meta?.total || 0, icon: Clock, color: 'text-yellow-600', href: '/admin/deals?status=DRAFT' },
    { label: 'Sold Deals', value: (soldDeals as any)?.adminDeals?.meta?.total || 0, icon: TrendingUp, color: 'text-green-600', href: '/admin/deals?status=SOLD' },
    { label: 'Declined', value: (declinedDeals as any)?.adminDeals?.meta?.total || 0, icon: Users, color: 'text-red-600', href: '/admin/deals?status=DECLINED' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground mt-1">Overview of your marketplace</p>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-muted p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{l1 || l2 || l3 || l4 ? '...' : stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Published Deals</h2>
              <Link href="/admin/deals?status=PUBLISHED" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="mt-4 space-y-3">
              {l1 ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)
              ) : (
                ((publishedDeals as any)?.adminDeals?.data || []).map((deal: any) => (
                  <div key={deal.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{deal.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">
                        {deal.seller?.name || 'Unknown'} · {deal.price ? `${deal.currency || 'USD'} ${Number(deal.price).toFixed(2)}` : 'No price'}
                      </p>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Published</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending Review</h2>
              <Link href="/admin/deals?status=DRAFT" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="mt-4 space-y-3">
              {l2 ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)
              ) : (
                ((draftDeals as any)?.adminDeals?.data || []).map((deal: any) => (
                  <div key={deal.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{deal.title || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">{deal.seller?.name || 'Unknown'}</p>
                    </div>
                    <span className="text-xs text-yellow-600 font-medium">Draft</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
