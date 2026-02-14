import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@marketplace/ui'
import { Package, Users } from 'lucide-react'

interface ProductDeal {
  id: number
  title?: string | null
  price?: number | null
  currency?: string | null
  condition?: string | null
  sellerName?: string | null
}

interface ProductCardProps {
  product: {
    id: number
    name: string
    images?: string[]
    category?: { key?: string; name?: string }
    brand?: { name?: string } | null
    shops?: { price?: number | null; currency?: string | null; available?: boolean | null }[]
    deals?: ProductDeal[]
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0]
  const availableShops = product.shops?.filter((s) => s.available && s.price != null) || []
  const minShopPrice = availableShops.reduce((min, s) => (s.price! < min ? s.price! : min), Infinity)
  const shopCurrency = availableShops.find((s) => s.price === minShopPrice)?.currency || 'USD'

  const publishedDeals = product.deals || []
  const dealsWithPrice = publishedDeals.filter((d) => d.price != null)
  const minDealPrice = dealsWithPrice.reduce((min, d) => (d.price! < min ? d.price! : min), Infinity)
  const dealCurrency = dealsWithPrice.find((d) => d.price === minDealPrice)?.currency || 'USD'

  const hasShopPrice = minShopPrice < Infinity
  const hasDealPrice = minDealPrice < Infinity

  return (
    <Link href={`/product/${product.id}`} className="block">
      <Card className="overflow-hidden glow-border hover:scale-[1.02] transition-all duration-300">
        <div className="aspect-square relative overflow-hidden bg-muted">
          {mainImage ? (
            <Image src={mainImage} alt={product.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12" />
            </div>
          )}
          {publishedDeals.length > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[hsl(var(--neon-green)/0.15)] border border-[hsl(var(--neon-green)/0.3)] px-2 py-0.5">
              <Users className="h-3 w-3 text-[hsl(var(--neon-green))]" />
              <span className="text-xs font-bold text-[hsl(var(--neon-green))]">
                {publishedDeals.length} {publishedDeals.length === 1 ? 'deal' : 'deals'}
              </span>
            </div>
          )}
        </div>
        <CardContent className="pt-3 pb-4">
          <h3 className="text-sm font-semibold truncate">{product.name}</h3>
          {product.brand?.name && (
            <p className="text-xs text-muted-foreground">{product.brand.name}</p>
          )}

          <div className="mt-2 space-y-1">
            {hasShopPrice && (
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">New</span>
                <span className="text-sm font-bold text-primary font-mono">
                  from {shopCurrency === 'EUR' ? '€' : '$'}{minShopPrice.toFixed(2)}
                </span>
              </div>
            )}
            {hasDealPrice && (
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[hsl(var(--neon-green))]">Used</span>
                <span className="text-sm font-bold text-[hsl(var(--neon-green))] font-mono">
                  from {dealCurrency === 'EUR' ? '€' : '$'}{minDealPrice.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
