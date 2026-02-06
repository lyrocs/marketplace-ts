'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { ADMIN_DEALS_QUERY, ADMIN_UPDATE_DEAL_STATUS_MUTATION, DEAL_QUERY } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Textarea,
} from '@nextrade/ui'
import { Pagination } from '@/components/shared/pagination'
import { Check, X, Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const statuses = ['PUBLISHED', 'DRAFT', 'DECLINED', 'SOLD', 'ARCHIVED', 'EXPIRED']

export default function AdminDealsPage() {
  const [activeStatus, setActiveStatus] = useState('PUBLISHED')
  const [page, setPage] = useState(1)
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [dealToDecline, setDealToDecline] = useState<number | null>(null)
  const { toast } = useToast()

  const { data, loading, refetch } = useQuery(ADMIN_DEALS_QUERY, {
    variables: { status: activeStatus, page, limit: 20 },
  })

  const { data: dealData, loading: dealLoading } = useQuery(DEAL_QUERY, {
    variables: { id: selectedDealId },
    skip: !selectedDealId,
  })

  const [updateStatus] = useMutation(ADMIN_UPDATE_DEAL_STATUS_MUTATION)

  const deals = data?.adminDeals?.data || []
  const meta = data?.adminDeals?.meta
  const deal = dealData?.deal

  const handleStatusChange = async (dealId: number, status: string, reason?: string) => {
    try {
      await updateStatus({ variables: { id: dealId, status, reason } })
      toast({ title: `Deal ${status.toLowerCase()}`, variant: 'default' })
      setDeclineDialogOpen(false)
      setDeclineReason('')
      setDealToDecline(null)
      setSelectedDealId(null)
      await refetch()
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  const openDeclineDialog = (dealId: number) => {
    setDealToDecline(dealId)
    setDeclineDialogOpen(true)
  }

  const handleDecline = () => {
    if (dealToDecline && declineReason.trim()) {
      handleStatusChange(dealToDecline, 'DECLINED', declineReason)
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
                        <Button variant="outline" size="sm" onClick={() => setSelectedDealId(deal.id)}>
                          <Eye className="mr-1 h-3 w-3" /> View
                        </Button>
                        {activeStatus === 'PUBLISHED' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openDeclineDialog(deal.id)}>
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
                            <Button variant="outline" size="sm" onClick={() => openDeclineDialog(deal.id)}>
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

      {/* Deal Detail Dialog */}
      <Dialog open={!!selectedDealId} onOpenChange={(open) => !open && setSelectedDealId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dealLoading ? 'Loading...' : (deal?.title || 'Untitled Deal')}</DialogTitle>
            {!dealLoading && deal && (
              <div className="flex items-center gap-2 mt-2">
                <Badge>{deal.status}</Badge>
                <Badge variant="outline">{deal.condition}</Badge>
                <span className="text-sm text-muted-foreground">
                  by {deal.seller?.name || 'Unknown'}
                </span>
              </div>
            )}
          </DialogHeader>

          {dealLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : deal ? (
            <>

              <div className="space-y-6 mt-4">
                {/* Images */}
                {deal.images && deal.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {deal.images.map((img: string, i: number) => (
                        <div key={i} className="relative h-32 rounded-lg overflow-hidden border">
                          <Image src={img} alt={`Deal image ${i + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price</Label>
                    <p className="text-lg font-semibold">{deal.currency || 'USD'} {Number(deal.price).toFixed(2)}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p>{deal.location || 'Not specified'}</p>
                  </div>
                </div>

                {/* Description */}
                {deal.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deal.description}</p>
                  </div>
                )}

                {/* Products */}
                {deal.products && deal.products.length > 0 && (
                  <div>
                    <Label>Products</Label>
                    <div className="space-y-2 mt-2">
                      {deal.products.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{p.productName}</p>
                            <p className="text-xs text-muted-foreground">{p.categoryName} · {p.brandName}</p>
                          </div>
                          <Badge variant="outline">Qty: {p.quantity}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                {deal.features && deal.features.length > 0 && (
                  <div>
                    <Label>Features</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {deal.features.map((f: any, i: number) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{f.label}:</span> {f.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label>Invoice Available</Label>
                    <p>{deal.invoiceAvailable ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <Label>Can Be Delivered</Label>
                    <p>{deal.canBeDelivered ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <Label>Selling Reason</Label>
                    <p className="text-muted-foreground">{deal.sellingReason || 'Not specified'}</p>
                  </div>
                </div>

                {deal.reasonDeclined && (
                  <div>
                    <Label className="text-destructive">Decline Reason</Label>
                    <p className="text-sm text-destructive">{deal.reasonDeclined}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <div className="flex gap-2 w-full justify-end">
                  <Button variant="outline" onClick={() => setSelectedDealId(null)}>Close</Button>
                  <Link href={`/deal/${deal.id}`} target="_blank">
                    <Button variant="outline">View Public Page</Button>
                  </Link>
                  {deal.status === 'DRAFT' && (
                    <>
                      <Button onClick={() => {
                        handleStatusChange(deal.id, 'PUBLISHED')
                      }}>
                        <Check className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button variant="destructive" onClick={() => {
                        setSelectedDealId(null)
                        openDeclineDialog(deal.id)
                      }}>
                        <X className="mr-1 h-4 w-4" /> Decline
                      </Button>
                    </>
                  )}
                </div>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Decline Reason Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Deal</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this deal. The seller will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Decline Reason *</Label>
              <Textarea
                id="reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Explain why this deal cannot be approved..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={!declineReason.trim()}
            >
              Decline Deal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
