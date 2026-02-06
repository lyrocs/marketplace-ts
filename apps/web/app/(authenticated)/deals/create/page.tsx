'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { CREATE_DEAL_DRAFT_MUTATION, UPDATE_DEAL_MUTATION, PUBLISH_DEAL_MUTATION, CATEGORIES_QUERY, BRANDS_QUERY, PRODUCTS_QUERY } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from '@/components/shared/image-upload'
import { ADD_DEAL_IMAGE_MUTATION, DELETE_DEAL_IMAGE_MUTATION } from '@/graphql/queries'
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
} from '@nextrade/ui'

export default function CreateDealPage() {
  const { user, loading: authLoading } = useAuthGuard()
  const router = useRouter()
  const { toast } = useToast()

  const [dealId, setDealId] = useState<number | null>(null)
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

  const [createDraft] = useMutation(CREATE_DEAL_DRAFT_MUTATION)
  const [updateDeal] = useMutation(UPDATE_DEAL_MUTATION)
  const [publishDeal] = useMutation(PUBLISH_DEAL_MUTATION)
  const [addImage] = useMutation(ADD_DEAL_IMAGE_MUTATION)
  const [deleteImage] = useMutation(DELETE_DEAL_IMAGE_MUTATION)

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const { data: brandsData } = useQuery(BRANDS_QUERY)

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>()
  const { data: productsData } = useQuery(PRODUCTS_QUERY, {
    variables: { categoryId: selectedCategoryId, limit: 50 },
  })

  // Create draft on mount
  useEffect(() => {
    if (user && !dealId) {
      createDraft().then(({ data }) => {
        if (data?.createDealDraft) setDealId(data.createDealDraft.id)
      })
    }
  }, [user, dealId, createDraft])

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
      toast({ title: 'Deal saved', variant: 'success' })
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' })
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
    } catch {
      toast({ title: 'Failed to publish', variant: 'destructive' })
    }
  }

  const handleAddImage = async (url: string) => {
    if (dealId) {
      await addImage({ variables: { dealId, imageUrl: url } })
      setImages((prev) => [...prev, url])
    }
  }

  const handleRemoveImage = async (url: string) => {
    if (dealId) {
      await deleteImage({ variables: { dealId, imageUrl: url } })
      setImages((prev) => prev.filter((img) => img !== url))
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

  if (authLoading) return null

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold">Create a Deal</h1>
      <p className="text-muted-foreground mt-1">Fill in the details and publish when ready</p>

      <form onSubmit={handleSave} className="mt-6 space-y-6">
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
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the deal..." />
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
              <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Textarea value={sellingReason} onChange={(e) => setSellingReason(e.target.value)} placeholder="Why are you selling?" />
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
                <Select value={selectedCategoryId?.toString() || ''} onValueChange={(v) => setSelectedCategoryId(v ? parseInt(v) : undefined)}>
                  <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    {(categoriesData?.categories || []).map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
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
                        <p className="text-xs text-muted-foreground">{product.category?.name}{product.brand ? ` · ${product.brand.name}` : ''}</p>
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

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" type="button" onClick={() => router.push('/deals/my')}>Cancel</Button>
          <div className="flex gap-3">
            <Button variant="outline" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Draft'}</Button>
            <Button type="button" onClick={handlePublish} disabled={saving}>Publish Deal</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
