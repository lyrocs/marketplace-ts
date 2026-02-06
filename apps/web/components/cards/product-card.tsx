import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@nextrade/ui'

interface ProductCardProps {
  product: {
    id: number
    name: string
    images?: string[]
    category?: { key?: string; name?: string }
    brand?: { name?: string } | null
    shops?: { price?: number | null; currency?: string | null; available?: boolean | null }[]
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images?.[0]
  const minPrice = product.shops
    ?.filter((s) => s.available && s.price != null)
    .reduce((min, s) => (s.price! < min ? s.price! : min), Infinity) ?? Infinity

  return (
    <Link href={`/product/${product.id}`} className="block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-square relative overflow-hidden bg-muted">
          {mainImage ? (
            <Image src={mainImage} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-4xl">📦</span>
            </div>
          )}
        </div>
        <CardContent className="pt-3">
          <h3 className="text-sm font-semibold truncate">{product.name}</h3>
          {product.brand?.name && (
            <p className="text-xs text-muted-foreground">{product.brand.name}</p>
          )}
          {minPrice < Infinity && (
            <p className="text-sm font-bold text-primary mt-1">
              From {product.shops?.find((s) => s.price === minPrice)?.currency || '$'}{minPrice.toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
