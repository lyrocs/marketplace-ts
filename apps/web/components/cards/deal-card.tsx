import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, Badge, Avatar, AvatarFallback, AvatarImage } from '@marketplace/ui'

interface DealCardProps {
  deal: {
    id: number
    title?: string | null
    price?: number | null
    currency?: string | null
    images?: string[]
    condition?: string
    createdAt?: string
    seller?: { id: string; name?: string | null; image?: string | null }
    products?: { productName?: string; categoryName?: string }[]
  }
}

const conditionColors: Record<string, string> = {
  NEW: 'bg-green-100 text-green-800',
  LIKE_NEW: 'bg-blue-100 text-blue-800',
  GOOD: 'bg-yellow-100 text-yellow-800',
  FAIR: 'bg-orange-100 text-orange-800',
  POOR: 'bg-red-100 text-red-800',
}

export function DealCard({ deal }: DealCardProps) {
  const mainImage = deal.images?.[0]
  const productNames = deal.products?.map((p) => p.productName).filter(Boolean).join(', ')

  return (
    <Link href={`/deal/${deal.id}`} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/20">
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={deal.title || 'Deal'}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-5xl">🏷️</span>
            </div>
          )}
          {deal.condition && (
            <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${conditionColors[deal.condition] || 'bg-gray-100 text-gray-800'}`}>
              {deal.condition.replace('_', ' ')}
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-base font-bold line-clamp-2 min-h-[3rem]">
            {deal.title || productNames || 'Untitled Deal'}
          </h3>
          {deal.price != null && (
            <p className="text-xl font-bold text-primary mt-2">
              {deal.currency || 'USD'} {Number(deal.price).toFixed(2)}
            </p>
          )}
          {deal.products?.[0]?.categoryName && (
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {deal.products[0].categoryName}
            </p>
          )}
          {deal.seller && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Avatar className="h-6 w-6">
                {deal.seller.image && <AvatarImage src={deal.seller.image} />}
                <AvatarFallback className="text-xs">{deal.seller.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">{deal.seller.name || 'Anonymous'}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
