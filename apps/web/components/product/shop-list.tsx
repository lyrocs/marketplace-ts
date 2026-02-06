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
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-muted-foreground">No shops available for this product</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-lg font-bold text-gray-800">{title}</h3>
      <div className="space-y-3">
        {shops.map((shop) => (
          <Link
            key={shop.id}
            href={shop.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 rounded-lg border p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-semibold text-slate-800 truncate">{shop.name}</span>
              <span
                className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${
                  shop.available
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {shop.available ? 'Available' : 'Not available'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {shop.price != null && (
                <p className="text-xl font-bold text-slate-800">
                  {shop.price} {getCurrencySymbol(shop.currency)}
                </p>
              )}
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
