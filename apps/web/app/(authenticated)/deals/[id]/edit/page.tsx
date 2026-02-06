'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { DEAL_QUERY } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { Skeleton } from '@nextrade/ui'

export default function EditDealPage() {
  const params = useParams()
  const dealId = parseInt(params.id as string)
  const { user, loading: authLoading } = useAuthGuard()
  const { data, loading } = useQuery(DEAL_QUERY, { variables: { id: dealId }, skip: !user })

  if (authLoading || loading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  const deal = data?.deal
  if (!deal || deal.userId !== user?.id) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-muted-foreground">Deal not found or unauthorized</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold">Edit Deal</h1>
      <p className="text-muted-foreground mt-1">
        Deal #{deal.id} · Status: <span className="font-semibold">{deal.status}</span>
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Use the Create Deal form flow to make changes. This page confirms deal ownership.
      </p>
    </div>
  )
}
