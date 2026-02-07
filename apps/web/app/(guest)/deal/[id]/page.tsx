'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import Image from 'next/image'
import Link from 'next/link'
import { DEAL_QUERY, START_DISCUSSION_MUTATION } from '@/graphql/queries'
import { Card, CardContent, Badge, Button, Avatar, AvatarFallback, AvatarImage, Skeleton } from '@marketplace/ui'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
}

export default function DealDetailPage() {
  const params = useParams()
  const dealId = parseInt(params.id as string)
  const { user, isAuthenticated } = useAuth()

  const { data, loading } = useQuery(DEAL_QUERY, { variables: { id: dealId } })
  const [startDiscussion] = useMutation(START_DISCUSSION_MUTATION)

  const deal = data?.deal
  const [selectedImage, setSelectedImage] = useState(0)
  const [discussionLoading, setDiscussionLoading] = useState(false)

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-muted-foreground">Deal not found</p>
        </div>
      </div>
    )
  }

  const images = deal.images || []
  const isOwner = user?.id === deal.userId

  const handleStartChat = async () => {
    if (!isAuthenticated || isOwner) return
    setDiscussionLoading(true)
    try {
      const { data: result } = await startDiscussion({ variables: { dealId } })
      if (result?.startDiscussion) {
        // Navigate to chat
        window.location.href = `/chat/${result.startDiscussion.id}`
      }
    } finally {
      setDiscussionLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Image Gallery */}
        <div className="lg:col-span-2 space-y-3">
          <div className="aspect-video relative overflow-hidden rounded-lg border bg-muted">
            {images[selectedImage] ? (
              <Image src={images[selectedImage]} alt={deal.title || 'Deal'} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">🏷️</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Products in Deal */}
          {deal.products && deal.products.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3">Products in this Deal</h3>
                <div className="space-y-2">
                  {deal.products.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{p.productName || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {p.categoryName}{p.brandName ? ` · ${p.brandName}` : ''}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">×{p.quantity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {deal.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{deal.description}</p>
            </div>
          )}

          {/* Features */}
          {deal.features && deal.features.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-2">
                {deal.features.map((f: any, i: number) => (
                  <div key={i} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{f.label}</p>
                    <p className="text-sm font-medium">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Price & Seller */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                {deal.price != null && (
                  <p className="text-3xl font-bold text-primary">
                    {deal.currency || 'USD'} {Number(deal.price).toFixed(2)}
                  </p>
                )}
                {deal.condition && (
                  <Badge variant="outline" className="mt-2">{conditionLabels[deal.condition] || deal.condition}</Badge>
                )}
              </div>

              <div className="space-y-1.5 text-sm">
                {deal.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{deal.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">{deal.canBeDelivered ? 'Available' : 'Pickup only'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice</span>
                  <span className="font-medium">{deal.invoiceAvailable ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {!isOwner && isAuthenticated && (
                <Button className="w-full" onClick={handleStartChat} disabled={discussionLoading}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {discussionLoading ? 'Opening...' : 'Contact Seller'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Seller Card */}
          {deal.seller && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Seller</h3>
                <Link href={`/profile/${deal.seller.id}`} className="flex items-center gap-3 hover:opacity-80">
                  <Avatar>
                    {deal.seller.image && <AvatarImage src={deal.seller.image} />}
                    <AvatarFallback>{deal.seller.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{deal.seller.name || 'Anonymous'}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
