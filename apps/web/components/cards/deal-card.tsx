import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, Avatar, AvatarFallback, AvatarImage } from '@marketplace/ui'
import { Tag } from 'lucide-react'

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
  NEW: 'bg-[hsl(var(--neon-green)/0.15)] text-[hsl(var(--neon-green))] border border-[hsl(var(--neon-green)/0.3)]',
  LIKE_NEW: 'bg-[hsl(185,100%,50%,0.15)] text-[hsl(185,100%,50%)] border border-[hsl(185,100%,50%,0.3)]',
  GOOD: 'bg-[hsl(var(--neon-orange)/0.15)] text-[hsl(var(--neon-orange))] border border-[hsl(var(--neon-orange)/0.3)]',
  FAIR: 'bg-[hsl(270,95%,65%,0.15)] text-[hsl(270,95%,65%)] border border-[hsl(270,95%,65%,0.3)]',
  POOR: 'bg-[hsl(0,85%,55%,0.15)] text-[hsl(0,85%,55%)] border border-[hsl(0,85%,55%,0.3)]',
}

export function DealCard({ deal }: DealCardProps) {
  const mainImage = deal.images?.[0]
  const productNames = deal.products?.map((p) => p.productName).filter(Boolean).join(', ')

  return (
    <Link href={`/deal/${deal.id}`} className="block group">
      <Card className="overflow-hidden glow-border hover:scale-[1.02] transition-all duration-300">
        <div className="aspect-square relative overflow-hidden bg-muted">
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
              <Tag className="h-12 w-12" />
            </div>
          )}
          {deal.condition && (
            <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold ${conditionColors[deal.condition] || 'bg-secondary text-muted-foreground'}`}>
              {deal.condition.replace('_', ' ')}
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-base font-bold line-clamp-2 min-h-[3rem]">
            {deal.title || productNames || 'Untitled Deal'}
          </h3>
          {deal.price != null && (
            <p className="text-xl font-bold text-primary font-mono mt-2">
              {deal.currency || 'USD'} {Number(deal.price).toFixed(2)}
            </p>
          )}
          {deal.products?.[0]?.categoryName && (
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {deal.products[0].categoryName}
            </p>
          )}
          {deal.seller && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
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
