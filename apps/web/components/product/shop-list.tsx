'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface Shop {
  id: number
  name: string
  url: string
  price?: number | null
  currency?: string | null
  available?: boolean | null
}

interface ShopListProps {
  shops: Shop[]
  title?: string
}

export function ShopList({ shops, title = 'Available Shops' }: ShopListProps) {
  const getCurrencySymbol = (currency?: string | null) => {
    return currency === 'EUR' ? '€' : '$'
  }

  if (!shops || shops.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="mb-4 text-lg font-bold text-foreground font-heading">{title}</h3>
        <p className="text-sm text-muted-foreground">No shops available for this product</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="mb-4 text-lg font-bold text-foreground font-heading">{title}</h3>
      <div className="space-y-3">
        {shops.map((shop) => (
          <Link
            key={shop.id}
            href={shop.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-3 hover:bg-white/5 transition-colors"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-semibold text-foreground truncate">{shop.name}</span>
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${
                  shop.available
                    ? 'bg-[hsl(var(--neon-green)/0.15)] text-[hsl(var(--neon-green))] border border-[hsl(var(--neon-green)/0.3)]'
                    : 'bg-[hsl(0,85%,55%,0.15)] text-[hsl(0,85%,55%)] border border-[hsl(0,85%,55%,0.3)]'
                }`}
              >
                {shop.available ? 'Available' : 'Not available'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {shop.price != null && (
                <p className="text-xl font-bold text-primary font-mono">
                  {shop.price} {getCurrencySymbol(shop.currency)}
                </p>
              )}
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
