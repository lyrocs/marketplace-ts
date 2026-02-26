'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { ADMIN_PRODUCT_QUERY, DELETE_PRODUCT_MUTATION, UPDATE_PRODUCT_MUTATION } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  Button,
  Badge,
  Label,
  Skeleton,
} from '@marketplace/ui'
import { ArrowLeft, Edit, Trash2, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ImageLightbox } from '@/components/shared/image-lightbox'

export default function AdminProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = parseInt(params.id as string)
  const { toast } = useToast()

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const { data, loading } = useQuery(ADMIN_PRODUCT_QUERY, {
    variables: { id: productId },
    skip: !productId,
  })
  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION)
  const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION)

  const product = (data as any)?.adminProduct

  const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || ''
  const isExternalImage = (url: string) => s3BaseUrl ? !url.startsWith(s3BaseUrl) : false

  const handleDelete = async () => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct({ variables: { id: productId } })
      toast({ title: 'Product deleted', variant: 'success' })
      router.push('/admin/products')
    } catch {
      toast({ title: 'Failed to delete product', variant: 'destructive' })
    }
  }

  const handleToggleStatus = async () => {
    if (!product) return
    const nextStatus: Record<string, string> = { active: 'draft', draft: 'active', ignored: 'draft' }
    const newStatus = nextStatus[product.status] || 'active'
    try {
      await updateProduct({ variables: { id: productId, status: newStatus } })
      toast({ title: `Status changed to ${newStatus}`, variant: 'success' })
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Link href="/admin/products">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleToggleStatus}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer ${
                  product.status === 'active'
                    ? 'bg-[hsl(var(--neon-green))]/15 text-[hsl(var(--neon-green))] hover:bg-[hsl(var(--neon-green))]/25'
                    : product.status === 'ignored'
                      ? 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                  product.status === 'active' ? 'bg-[hsl(var(--neon-green))]'
                    : product.status === 'ignored' ? 'bg-amber-500'
                      : 'bg-muted-foreground/50'
                }`} />
                {product.status}
              </button>
              <span className="text-sm text-muted-foreground">
                {product.category?.name} {product.brand && `· ${product.brand.name}`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/product/${product.id}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View Public Page
            </Button>
          </Link>
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button size="sm">
              <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* Images */}
        {product.images && product.images.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Images</h3>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img: string, i: number) => (
                  <div
                    key={i}
                    className="relative h-40 rounded-lg overflow-hidden border cursor-pointer group"
                    onClick={() => { setLightboxIndex(i); setLightboxOpen(true) }}
                  >
                    <Image src={img} alt={`Product image ${i + 1}`} fill className="object-cover" />
                    {isExternalImage(img) && (
                      <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        <ExternalLink className="h-2.5 w-2.5" />
                        External
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {product.description && (
          <Card>
            <CardContent className="p-4">
              <Label>Description</Label>
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <Label>Features</Label>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                {product.features.map((feature: string, i: number) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Specifications */}
        {product.specs && product.specs.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <Label>Specifications</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {product.specs.map((spec: any) => (
                  <div key={spec.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">{spec.specType?.label}:</span>
                    <Badge variant="secondary">{spec.value}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shop Links */}
        {product.shops && product.shops.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <Label>Available at {product.shops.length} shop(s)</Label>
              <div className="space-y-2 mt-2">
                {product.shops.map((shop: any) => (
                  <div key={shop.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{shop.name}</p>
                      <a href={shop.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        {shop.url}
                      </a>
                    </div>
                    <div className="text-right">
                      {shop.price && (
                        <p className="font-semibold">{shop.currency || 'USD'} {Number(shop.price).toFixed(2)}</p>
                      )}
                      <Badge variant={shop.available ? 'default' : 'secondary'}>
                        {shop.available ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Created</Label>
                <p className="text-muted-foreground">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <Label>Updated</Label>
                <p className="text-muted-foreground">{new Date(product.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ImageLightbox
        images={product.images || []}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
