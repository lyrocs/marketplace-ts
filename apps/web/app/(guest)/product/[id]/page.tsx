'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
import Image from 'next/image'
import { PRODUCT_QUERY } from '@/graphql/queries'
import { Card, CardContent, Badge, Skeleton } from '@nextrade/ui'
import { ExternalLink } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = parseInt(params.id as string)

  const { data, loading } = useQuery(PRODUCT_QUERY, { variables: { id: productId } })
  const product = data?.product

  const [selectedImage, setSelectedImage] = useState(0)

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-muted-foreground">Product not found</p>
        </div>
      </div>
    )
  }

  const images = product.images || []
  const availableShops = product.shops?.filter((s: any) => s.available) || []
  const minPrice = availableShops.reduce(
    (min: number, s: any) => (s.price != null && s.price < min ? s.price : min),
    Infinity
  )

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-square relative overflow-hidden rounded-lg border bg-muted">
            {images[selectedImage] ? (
              <Image src={images[selectedImage]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">📦</div>
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
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.brand && <p className="text-muted-foreground">{product.brand.name}</p>}
            <div className="flex gap-2 mt-2">
              {product.category && <Badge variant="outline">{product.category.name}</Badge>}
            </div>
          </div>

          {minPrice < Infinity && (
            <div>
              <p className="text-3xl font-bold text-primary">
                From ${minPrice.toFixed(2)}
              </p>
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          {/* Available Shops */}
          {product.shops && product.shops.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Where to buy</h3>
              <div className="space-y-2">
                {product.shops.map((shop: any) => (
                  <Card key={shop.id}>
                    <CardContent className="flex items-center justify-between py-3 px-4">
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        {shop.available ? (
                          <span className="text-sm text-green-600">In stock</span>
                        ) : (
                          <span className="text-sm text-red-600">Out of stock</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {shop.price != null && (
                          <span className="font-bold">{shop.currency || '$'}{shop.price.toFixed(2)}</span>
                        )}
                        <a
                          href={shop.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
