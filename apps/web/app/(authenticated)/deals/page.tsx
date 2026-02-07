'use client'

import { useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { MY_DEALS_QUERY } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { Card, CardContent, Badge, Button, Skeleton } from '@marketplace/ui'
import { Plus } from 'lucide-react'

const statusColors: Record<string, string> = {
  DRAFT: 'secondary',
  PUBLISHED: 'success',
  DECLINED: 'destructive',
  EXPIRED: 'outline',
  SOLD: 'default',
  ARCHIVED: 'outline',
}

export default function MyDealsPage() {
  const { user, loading: authLoading } = useAuthGuard()
  const { data, loading } = useQuery(MY_DEALS_QUERY, { skip: !user })

  if (authLoading) return null

  const deals = data?.myDeals || []

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Deals</h1>
        <Link href="/deals/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Deal
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium text-muted-foreground">No deals yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first deal to get started</p>
              <Link href="/deals/create" className="mt-4 inline-block">
                <Button>Create a Deal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {deals.map((deal: any) => (
              <Link key={deal.id} href={`/deals/${deal.id}/edit`} className="block">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg border bg-muted overflow-hidden">
                      {deal.images?.[0] ? (
                        <img src={deal.images[0]} alt="Deal" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl">🏷️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {deal.title || deal.products?.map((p: any) => p.productName).filter(Boolean).join(', ') || 'Untitled'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {deal.price ? `${deal.currency || 'USD'} ${Number(deal.price).toFixed(2)}` : 'No price set'} · {deal.products?.length || 0} product(s)
                      </p>
                    </div>
                    <Badge variant={statusColors[deal.status] as any || 'outline'}>
                      {deal.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
