'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ADMIN_DEALS_QUERY, ADMIN_UPDATE_DEAL_STATUS_MUTATION } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
} from '@nextrade/ui'
import { Pagination } from '@/components/shared/pagination'
import { Check, X } from 'lucide-react'

const statuses = ['PUBLISHED', 'DRAFT', 'DECLINED', 'SOLD', 'ARCHIVED', 'EXPIRED']

export default function AdminDealsPage() {
  const [activeStatus, setActiveStatus] = useState('PUBLISHED')
  const [page, setPage] = useState(1)
  const [selectedDeal, setSelectedDeal] = useState<any>(null)
  const [declineReason, setDeclineReason] = useState('')
  const { toast } = useToast()

  const { data, loading, refetch } = useQuery(ADMIN_DEALS_QUERY, {
    variables: { status: activeStatus, page, limit: 20 },
  })

  const [updateStatus] = useMutation(ADMIN_UPDATE_DEAL_STATUS_MUTATION)

  const deals = data?.adminDeals?.data || []
  const meta = data?.adminDeals?.meta

  const handleStatusChange = async (dealId: number, status: string, reason?: string) => {
    try {
      await updateStatus({ variables: { id: dealId, status, reason } })
      toast({ title: `Deal ${status.toLowerCase()}`, variant: 'success' })
      setSelectedDeal(null)
      setDeclineReason('')
      await refetch()
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Deal Management</h1>
      <p className="text-muted-foreground mt-1">Review, approve, and manage deals</p>

      <Tabs value={activeStatus} onValueChange={(v) => { setActiveStatus(v); setPage(1) }} className="mt-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {statuses.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">{s.toLowerCase()}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
            </div>
          ) : deals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No {activeStatus.toLowerCase()} deals</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {deals.map((deal: any) => (
                  <Card key={deal.id}>
                    <CardContent className="flex items-start gap-4 py-4">
                      {/* Thumbnail */}
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg border bg-muted overflow-hidden">
                        {deal.images?.[0] ? (
                          <img src={deal.images[0]} alt="Deal" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl">🏷️</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{deal.title || 'Untitled'}</h3>
                          <Badge variant="outline" className="text-xs">{deal.condition}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          by {deal.seller?.name || 'Unknown'} · {deal.price ? `${deal.currency || 'USD'} ${Number(deal.price).toFixed(2)}` : 'No price'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deal.products?.map((p: any) => p.productName).filter(Boolean).join(', ') || 'No products'}
                        </p>
                        {deal.reasonDeclined && (
                          <p className="text-xs text-red-600 mt-1">Reason: {deal.reasonDeclined}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {activeStatus === 'PUBLISHED' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setSelectedDeal(deal)}>
                              <X className="mr-1 h-3 w-3" /> Decline
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleStatusChange(deal.id, 'SOLD')}>
                              Sold
                            </Button>
                          </>
                        )}
                        {activeStatus === 'DRAFT' && (
                          <>
                            <Button size="sm" onClick={() => handleStatusChange(deal.id, 'PUBLISHED')}>
                              <Check className="mr-1 h-3 w-3" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedDeal(deal)}>
                              <X className="mr-1 h-3 w-3" /> Decline
                            </Button>
                          </>
                        )}
                        {(activeStatus === 'DECLINED' || activeStatus === 'ARCHIVED') && (
                          <Button variant="outline" size="sm" onClick={() => handleStatusChange(deal.id, 'PUBLISHED')}>
                            Restore
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </Tabs>

      {/* Decline Dialog */}
      <Dialog open={!!selectedDeal} onOpenChange={(open) => { if (!open) { setSelectedDeal(null); setDeclineReason('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Deal</DialogTitle>
            <DialogDescription>
              Provide a reason for declining "{selectedDeal?.title || 'this deal'}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input id="reason" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} placeholder="e.g., Duplicate listing, policy violation..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedDeal(null); setDeclineReason('') }}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedDeal && handleStatusChange(selectedDeal.id, 'DECLINED', declineReason)}>
              Decline Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
