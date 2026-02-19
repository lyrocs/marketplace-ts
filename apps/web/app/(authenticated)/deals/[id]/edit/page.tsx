'use client'

import { useQuery } from '@apollo/client/react'
import { useParams, useRouter } from 'next/navigation'
import { DEAL_QUERY } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { DealFormStepper } from '@/components/deal/deal-form-stepper'
import {
  Card,
  CardContent,
  Button,
  Skeleton,
} from '@marketplace/ui'

export default function EditDealPage() {
  const params = useParams()
  const dealId = parseInt(params.id as string)
  const { user, loading: authLoading } = useAuthGuard()
  const router = useRouter()

  const { data: dealData, loading: dealLoading } = useQuery(DEAL_QUERY, {
    variables: { id: dealId },
    skip: !user,
  })

  if (authLoading || dealLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  const deal = dealData?.deal
  if (!deal || deal.userId !== user?.id) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Deal not found</h2>
              <p className="text-muted-foreground mt-2">
                This deal doesn&apos;t exist or you don&apos;t have permission to edit it.
              </p>
              <Button onClick={() => router.push('/deals')} className="mt-4">
                Go to My Deals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DealFormStepper
      mode="edit"
      dealId={dealId}
      initialData={{
        title: deal.title || '',
        description: deal.description || '',
        location: deal.location || '',
        currency: deal.currency || 'USD',
        price: deal.price?.toString() || '',
        condition: deal.condition || 'GOOD',
        invoiceAvailable: deal.invoiceAvailable || false,
        canBeDelivered: deal.canBeDelivered || false,
        sellingReason: deal.sellingReason || '',
        images: deal.images || [],
        selectedProducts: deal.products?.map((p: any) => ({
          productId: p.productId,
          quantity: p.quantity || 1,
        })) || [],
        status: deal.status,
        reasonDeclined: deal.reasonDeclined,
      }}
    />
  )
}
