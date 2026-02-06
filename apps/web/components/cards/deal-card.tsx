import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, Badge, Avatar, AvatarFallback, AvatarImage } from '@nextrade/ui'

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
    <Link href={`/deal/${deal.id}`} className="block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-square relative overflow-hidden bg-muted">
          {mainImage ? (
            <Image src={mainImage} alt={deal.title || 'Deal'} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-4xl">🏷️</span>
            </div>
          )}
          {deal.condition && (
            <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-semibold ${conditionColors[deal.condition] || ''}`}>
              {deal.condition.replace('_', ' ')}
            </span>
          )}
        </div>
        <CardContent className="pt-3">
          <h3 className="text-sm font-semibold truncate">{deal.title || productNames || 'Untitled Deal'}</h3>
          {deal.price != null && (
            <p className="text-lg font-bold text-primary mt-0.5">
              {deal.currency || 'USD'} {Number(deal.price).toFixed(2)}
            </p>
          )}
          {deal.products?.[0]?.categoryName && (
            <p className="text-xs text-muted-foreground mt-1">{deal.products[0].categoryName}</p>
          )}
          {deal.seller && (
            <div className="flex items-center gap-2 mt-3">
              <Avatar className="h-5 w-5">
                {deal.seller.image && <AvatarImage src={deal.seller.image} />}
                <AvatarFallback className="text-xs">{deal.seller.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{deal.seller.name || 'Anonymous'}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
