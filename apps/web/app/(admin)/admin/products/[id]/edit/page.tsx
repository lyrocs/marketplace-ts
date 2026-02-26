'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { ADMIN_PRODUCT_QUERY, UPDATE_PRODUCT_MUTATION, UPDATE_PRODUCT_SPECS_MUTATION, ADD_PRODUCT_IMAGE_MUTATION, DELETE_PRODUCT_IMAGE_MUTATION, REUPLOAD_PRODUCT_IMAGES_MUTATION, CATEGORIES_QUERY, BRANDS_QUERY, SPEC_TYPES_QUERY } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from '@/components/shared/image-upload'
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Skeleton,
  Textarea,
  Checkbox,
} from '@marketplace/ui'
import { ArrowLeft, Plus, X, Upload, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ImageLightbox } from '@/components/shared/image-lightbox'

export default function AdminProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const productId = parseInt(params.id as string)
  const { toast } = useToast()
  const featuresRef = useRef<HTMLInputElement>(null)

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const [editProduct, setEditProduct] = useState({
    id: 0, name: '', categoryId: '', brandId: '', description: '', status: 'draft',
    features: [] as string[], specIds: [] as number[], images: [] as string[],
  })
  const [loaded, setLoaded] = useState(false)

  const { data: productData, loading: productLoading } = useQuery(ADMIN_PRODUCT_QUERY, {
    variables: { id: productId },
    skip: !productId,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    const p = (productData as any)?.adminProduct
    if (!p || loaded) return
    setEditProduct({
      id: p.id,
      name: p.name,
      categoryId: (p.categoryId || p.category?.id || '').toString(),
      brandId: (p.brandId || p.brand?.id || '').toString(),
      description: p.description || '',
      status: p.status || 'draft',
      features: Array.isArray(p.features) ? p.features : [],
      specIds: p.specs?.map((s: any) => s.id) || [],
      images: Array.isArray(p.images) ? p.images : [],
    })
    setLoaded(true)
  }, [productData, loaded])
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const { data: brandsData } = useQuery(BRANDS_QUERY)
  const { data: specTypesData } = useQuery(SPEC_TYPES_QUERY)
  const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION)
  const [updateProductSpecs] = useMutation(UPDATE_PRODUCT_SPECS_MUTATION)
  const [addProductImage] = useMutation(ADD_PRODUCT_IMAGE_MUTATION)
  const [deleteProductImage] = useMutation(DELETE_PRODUCT_IMAGE_MUTATION)
  const [reuploadImages, { loading: reuploading }] = useMutation(REUPLOAD_PRODUCT_IMAGES_MUTATION)

  const specTypes = (specTypesData as any)?.specTypes || []
  const brands = (brandsData as any)?.brands || []

  const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || ''
  const isExternalImage = (url: string) => s3BaseUrl ? !url.startsWith(s3BaseUrl) : false
  const hasExternalImages = (imgs: string[]) => imgs.some(isExternalImage)

  const brandSuggestions = useMemo(
    () => {
      if (editProduct.brandId || !editProduct.name) return []
      const nameLower = editProduct.name.toLowerCase()
      return brands.filter((b: any) => nameLower.includes(b.name.toLowerCase()))
    },
    [editProduct.name, editProduct.brandId, brands]
  )

  const handleReuploadImages = async () => {
    try {
      const { data } = await reuploadImages({ variables: { productId: editProduct.id } })
      if ((data as any)?.reuploadProductImages?.images) {
        setEditProduct({ ...editProduct, images: (data as any).reuploadProductImages.images })
      }
      toast({ title: 'Images uploaded to S3', variant: 'success' })
    } catch {
      toast({ title: 'Failed to upload images', variant: 'destructive' })
    }
  }

  const handleImageAdded = async (url: string) => {
    try {
      await addProductImage({ variables: { productId: editProduct.id, imageUrl: url } })
      setEditProduct({ ...editProduct, images: [...editProduct.images, url] })
      toast({ title: 'Image added', variant: 'success' })
    } catch {
      toast({ title: 'Failed to add image', variant: 'destructive' })
    }
  }

  const handleImageRemoved = async (url: string) => {
    try {
      await deleteProductImage({ variables: { productId: editProduct.id, imageUrl: url } })
      setEditProduct({ ...editProduct, images: editProduct.images.filter(img => img !== url) })
      toast({ title: 'Image removed', variant: 'success' })
    } catch {
      toast({ title: 'Failed to remove image', variant: 'destructive' })
    }
  }

  const handleUpdate = async () => {
    if (!editProduct.name || !editProduct.categoryId) {
      toast({ title: 'Name and category are required', variant: 'destructive' })
      return
    }
    try {
      await updateProduct({
        variables: {
          id: editProduct.id,
          name: editProduct.name,
          categoryId: parseInt(editProduct.categoryId),
          brandId: editProduct.brandId ? parseInt(editProduct.brandId) : undefined,
          description: editProduct.description || undefined,
          features: editProduct.features,
          status: editProduct.status,
        },
      })
      await updateProductSpecs({
        variables: { productId: editProduct.id, specIds: editProduct.specIds },
      })
      toast({ title: 'Product updated', variant: 'success' })
      router.push(`/admin/products/${editProduct.id}`)
    } catch {
      toast({ title: 'Failed to update product', variant: 'destructive' })
    }
  }

  const openLightbox = (images: string[], index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (productLoading || !loaded) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/products/${productId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditProduct({ ...editProduct, status: editProduct.status === 'active' ? 'draft' : 'active' })}
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
              editProduct.status === 'active'
                ? 'bg-[hsl(var(--neon-green))]/15 text-[hsl(var(--neon-green))] hover:bg-[hsl(var(--neon-green))]/25'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${editProduct.status === 'active' ? 'bg-[hsl(var(--neon-green))]' : 'bg-muted-foreground/50'}`} />
            {editProduct.status}
          </button>
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Product Name</Label>
            <Input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Product Images</Label>
              {hasExternalImages(editProduct.images) && (
                <Button variant="outline" size="sm" onClick={handleReuploadImages} disabled={reuploading}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  {reuploading ? 'Uploading...' : 'Upload all to S3'}
                </Button>
              )}
            </div>
            {editProduct.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {editProduct.images.map((url, i) => (
                  <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border group">
                    <div className="cursor-pointer h-full" onClick={() => openLightbox(editProduct.images, i)}>
                      <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
                    </div>
                    {isExternalImage(url) && (
                      <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        <ExternalLink className="h-2.5 w-2.5" />
                        External
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleImageRemoved(url)}
                      className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <ImageUpload
              images={[]}
              onImageAdded={handleImageAdded}
              onImageRemoved={handleImageRemoved}
              maxImages={10 - editProduct.images.length}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={editProduct.categoryId} onValueChange={(v) => setEditProduct({ ...editProduct, categoryId: v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {((categoriesData as any)?.categories || []).map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Select value={editProduct.brandId} onValueChange={(v) => setEditProduct({ ...editProduct, brandId: v })}>
              <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>
                {brands.map((brand: any) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {brandSuggestions.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Detected:</span>
                {brandSuggestions.map((brand: any) => (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => setEditProduct({ ...editProduct, brandId: brand.id.toString() })}
                    className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={editProduct.description}
              onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Features</Label>
            {editProduct.features.length > 0 && (
              <div className="grid grid-cols-2 gap-1.5">
                {editProduct.features.map((feature, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between rounded-md border border-border/50 bg-white/5 px-2.5 py-1.5 text-sm text-foreground hover:border-primary/30 transition-colors"
                  >
                    <span className="truncate">{feature}</span>
                    <button
                      type="button"
                      onClick={() => setEditProduct({ ...editProduct, features: editProduct.features.filter((_, idx) => idx !== i) })}
                      className="ml-2 shrink-0 rounded-full p-0.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              className="flex items-center rounded-lg border border-border bg-input px-3 py-2 cursor-text focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-colors"
              onClick={() => featuresRef.current?.focus()}
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground/50 mr-2 shrink-0" />
              <input
                ref={featuresRef}
                type="text"
                placeholder="Type a feature and press Enter..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                onKeyDown={(e) => {
                  const value = (e.target as HTMLInputElement).value.trim()
                  if (e.key === 'Enter' && value) {
                    e.preventDefault()
                    setEditProduct({ ...editProduct, features: [...editProduct.features, value] });
                    (e.target as HTMLInputElement).value = ''
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Specifications</Label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
              {specTypes.map((specType: any) => (
                <div key={specType.id} className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{specType.label}</p>
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    {specType.specs?.map((spec: any) => (
                      <div key={spec.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`spec-${spec.id}`}
                          checked={editProduct.specIds.includes(spec.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditProduct({ ...editProduct, specIds: [...editProduct.specIds, spec.id] })
                            } else {
                              setEditProduct({ ...editProduct, specIds: editProduct.specIds.filter(id => id !== spec.id) })
                            }
                          }}
                        />
                        <label htmlFor={`spec-${spec.id}`} className="text-sm cursor-pointer">
                          {spec.value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Link href={`/admin/products/${productId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleUpdate}>Update Product</Button>
      </div>

      <ImageLightbox
        images={editProduct.images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
