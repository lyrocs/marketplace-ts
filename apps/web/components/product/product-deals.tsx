import Link from 'next/link'
import { Avatar, AvatarFallback } from '@marketplace/ui'
import { Tag } from 'lucide-react'

interface ProductDeal {
  id: number
  title?: string | null
  price?: number | null
  currency?: string | null
  condition?: string | null
  sellerName?: string | null
}

interface ProductDealsProps {
  deals: ProductDeal[]
  title?: string
}

const conditionColors: Record<string, string> = {
  NEW: 'bg-[hsl(var(--neon-green)/0.15)] text-[hsl(var(--neon-green))] border border-[hsl(var(--neon-green)/0.3)]',
  LIKE_NEW: 'bg-[hsl(185,100%,50%,0.15)] text-[hsl(185,100%,50%)] border border-[hsl(185,100%,50%,0.3)]',
  GOOD: 'bg-[hsl(var(--neon-orange)/0.15)] text-[hsl(var(--neon-orange))] border border-[hsl(var(--neon-orange)/0.3)]',
  FAIR: 'bg-[hsl(270,95%,65%,0.15)] text-[hsl(270,95%,65%)] border border-[hsl(270,95%,65%,0.3)]',
  POOR: 'bg-[hsl(0,85%,55%,0.15)] text-[hsl(0,85%,55%)] border border-[hsl(0,85%,55%,0.3)]',
}

const conditionLabels: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
}

export function ProductDeals({ deals, title = 'Community Deals' }: ProductDealsProps) {
  if (!deals || deals.length === 0) return null

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="h-4 w-4 text-[hsl(var(--neon-green))]" />
        <h3 className="text-lg font-bold text-foreground font-heading">{title}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{deals.length} {deals.length === 1 ? 'listing' : 'listings'}</span>
      </div>
      <div className="space-y-3">
        {deals.map((deal) => (
          <Link
            key={deal.id}
            href={`/deal/${deal.id}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-3 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {deal.sellerName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{deal.sellerName || 'Anonymous'}</p>
                {deal.condition && (
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold mt-0.5 ${conditionColors[deal.condition] || 'bg-secondary text-muted-foreground'}`}>
                    {conditionLabels[deal.condition] || deal.condition}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0 text-right">
              {deal.price != null && (
                <p className="text-base font-bold text-[hsl(var(--neon-green))] font-mono">
                  {deal.currency === 'EUR' ? '€' : '$'}{Number(deal.price).toFixed(2)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
