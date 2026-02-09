'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { useParams, useRouter } from 'next/navigation'
import {
  DEAL_QUERY,
  UPDATE_DEAL_MUTATION,
  PUBLISH_DEAL_MUTATION,
  CATEGORIES_QUERY,
  PRODUCTS_QUERY,
  ADD_DEAL_IMAGE_MUTATION,
  DELETE_DEAL_IMAGE_MUTATION,
} from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from '@/components/shared/image-upload'
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Skeleton,
} from '@marketplace/ui'

export default function EditDealPage() {
  const params = useParams()
  const dealId = parseInt(params.id as string)
  const { user, loading: authLoading } = useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('GOOD')
  const [invoiceAvailable, setInvoiceAvailable] = useState(false)
  const [canBeDelivered, setCanBeDelivered] = useState(false)
  const [sellingReason, setSellingReason] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<{ productId: number; quantity: number }[]>([])
  const [saving, setSaving] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Queries and Mutations
  const { data: dealData, loading: dealLoading } = useQuery(DEAL_QUERY, {
    variables: { id: dealId },
    skip: !user,
  })

  const [updateDeal] = useMutation(UPDATE_DEAL_MUTATION)
  const [publishDeal] = useMutation(PUBLISH_DEAL_MUTATION)
  const [addImage] = useMutation(ADD_DEAL_IMAGE_MUTATION)
  const [deleteImage] = useMutation(DELETE_DEAL_IMAGE_MUTATION)

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>()
  const { data: productsData } = useQuery(PRODUCTS_QUERY, {
    variables: { categoryId: selectedCategoryId, limit: 50 },
  })

  // Load deal data into form
  useEffect(() => {
    if (dealData?.deal && !dataLoaded) {
      const deal = dealData.deal
      setTitle(deal.title || '')
      setDescription(deal.description || '')
      setLocation(deal.location || '')
      setCurrency(deal.currency || 'USD')
      setPrice(deal.price?.toString() || '')
      setCondition(deal.condition || 'GOOD')
      setInvoiceAvailable(deal.invoiceAvailable || false)
      setCanBeDelivered(deal.canBeDelivered || false)
      setSellingReason(deal.sellingReason || '')
      setImages(deal.images || [])

      // Load products
      if (deal.products && deal.products.length > 0) {
        setSelectedProducts(
          deal.products.map((p: any) => ({
            productId: p.productId,
            quantity: p.quantity || 1,
          }))
        )
      }

      setDataLoaded(true)
    }
  }, [dealData, dataLoaded])

  const handleSave = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!dealId) return
    setSaving(true)
    try {
      await updateDeal({
        variables: {
          id: dealId,
          title,
          description,
          location,
          currency,
          price: price ? parseFloat(price) : undefined,
          invoiceAvailable,
          canBeDelivered,
          sellingReason,
          condition,
          products: selectedProducts,
        },
      })
      toast({ title: 'Deal updated', variant: 'success' })
    } catch (error: any) {
      toast({
        title: 'Failed to update',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!dealId) return
    await handleSave()
    try {
      await publishDeal({ variables: { id: dealId } })
      toast({ title: 'Deal published!', variant: 'success' })
      router.push(`/deal/${dealId}`)
    } catch (error: any) {
      toast({
        title: 'Failed to publish',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleAddImage = async (url: string) => {
    if (dealId) {
      try {
        await addImage({ variables: { dealId, imageUrl: url } })
        setImages((prev) => [...prev, url])
        toast({ title: 'Image added', variant: 'success' })
      } catch (error: any) {
        toast({
          title: 'Failed to add image',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
  }

  const handleRemoveImage = async (url: string) => {
    if (dealId) {
      try {
        await deleteImage({ variables: { dealId, imageUrl: url } })
        setImages((prev) => prev.filter((img) => img !== url))
        toast({ title: 'Image removed', variant: 'success' })
      } catch (error: any) {
        toast({
          title: 'Failed to remove image',
          description: error.message,
          variant: 'destructive',
        })
      }
    }
  }

  const handleProductToggle = (productId: number) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.productId === productId)
      if (exists) {
        return prev.filter((p) => p.productId !== productId)
      }
      return [...prev, { productId, quantity: 1 }]
    })
  }

  // Loading state
  if (authLoading || dealLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  // Authorization check
  const deal = dealData?.deal
  if (!deal || deal.userId !== user?.id) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Deal not found</h2>
              <p className="text-muted-foreground mt-2">
                This deal doesn't exist or you don't have permission to edit it.
              </p>
              <Button onClick={() => router.push('/deals')} className="mt-4">
                Go to My Deals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Deal</h1>
          <p className="text-muted-foreground mt-1">
            Deal #{deal.id} · Status: <span className="font-semibold capitalize">{deal.status.toLowerCase()}</span>
          </p>
        </div>
        {deal.status === 'PUBLISHED' && (
          <Button variant="outline" onClick={() => router.push(`/deal/${dealId}`)}>
            View Live Deal
          </Button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Images */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Photos</h2>
            <ImageUpload images={images} onImageAdded={handleAddImage} onImageRemoved={handleRemoveImage} />
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deal title" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the deal..."
                  rows={5}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Price</Label>
                <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="PLN">PLN (zł)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3">
                <Switch checked={invoiceAvailable} onCheckedChange={setInvoiceAvailable} />
                <Label>Invoice available</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={canBeDelivered} onCheckedChange={setCanBeDelivered} />
                <Label>Can be delivered</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condition */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Condition</h2>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="LIKE_NEW">Like New</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="FAIR">Fair</SelectItem>
                <SelectItem value="POOR">Poor</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-4 space-y-1.5">
              <Label>Selling Reason (optional)</Label>
              <Textarea
                value={sellingReason}
                onChange={(e) => setSellingReason(e.target.value)}
                placeholder="Why are you selling?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Products</h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Filter by Category</Label>
                <Select
                  value={selectedCategoryId?.toString() || 'all'}
                  onValueChange={(v) => setSelectedCategoryId(v === 'all' ? undefined : parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {(categoriesData?.categories || []).map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border p-3">
                {(productsData?.products?.data || []).map((product: any) => {
                  const isSelected = selectedProducts.some((p) => p.productId === product.id)
                  return (
                    <label key={product.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleProductToggle(product.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.category?.name}
                          {product.brand ? ` · ${product.brand.name}` : ''}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
              {selectedProducts.length > 0 && (
                <p className="text-sm text-muted-foreground">{selectedProducts.length} product(s) selected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Declined Reason (if applicable) */}
        {deal.status === 'DECLINED' && deal.reasonDeclined && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-destructive mb-2">Deal Declined</h2>
              <p className="text-sm text-muted-foreground">{deal.reasonDeclined}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please address the issues above and save your changes before republishing.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" type="button" onClick={() => router.push('/deals')}>
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            {deal.status === 'DRAFT' && (
              <Button type="button" onClick={handlePublish} disabled={saving}>
                Publish Deal
              </Button>
            )}
            {deal.status === 'DECLINED' && (
              <Button type="button" onClick={handlePublish} disabled={saving}>
                Republish Deal
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
