import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchGraphQL } from '@/lib/graphql-server'
import { DEAL_QUERY } from '@/graphql/queries'
import { ProductGallery } from '@/components/product/product-gallery'
import { DealContactButton } from '@/components/deal/deal-contact-button'
import { Card, CardContent, Badge, Avatar, AvatarFallback, AvatarImage } from '@marketplace/ui'
import { ChevronRight } from 'lucide-react'

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dealId = parseInt(id)

  if (isNaN(dealId)) notFound()

  const data = await fetchGraphQL(DEAL_QUERY, { id: dealId })
  const deal = (data as any)?.deal

  if (!deal || (deal.status !== 'PUBLISHED' && deal.status !== 'SOLD')) notFound()

  const images = deal.images || []

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Image Gallery */}
        <div className="lg:col-span-2 space-y-3">
          <ProductGallery images={images} />

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
                {deal.status === 'SOLD' && (
                  <Badge variant="destructive" className="mb-2 text-sm">SOLD</Badge>
                )}
                {deal.price != null && (
                  <p className={`text-3xl font-bold ${deal.status === 'SOLD' ? 'text-muted-foreground line-through' : 'text-primary'}`}>
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

              {deal.status !== 'SOLD' && (
                <DealContactButton dealId={dealId} sellerId={deal.userId} />
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
