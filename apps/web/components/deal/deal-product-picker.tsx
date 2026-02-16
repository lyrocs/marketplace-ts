'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { PRODUCTS_QUERY, CATEGORIES_QUERY, BRANDS_QUERY, SUGGEST_PRODUCT_MUTATION } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import {
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@marketplace/ui'
import { Search, X, Plus, Package, Check, Tag, Store } from 'lucide-react'
import Image from 'next/image'

interface SelectedProduct {
  productId: number
  quantity: number
}

interface ProductInfo {
  id: number
  name: string
  category?: string
  brand?: string
  image?: string
  price?: number
  currency?: string
  shopCount?: number
}

interface DealProductPickerProps {
  selectedProducts: SelectedProduct[]
  onProductsChange: (products: SelectedProduct[]) => void
}

export function DealProductPicker({ selectedProducts, onProductsChange }: DealProductPickerProps) {
  const { toast } = useToast()
  const searchRef = useRef<HTMLInputElement>(null)

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductCategoryId, setNewProductCategoryId] = useState('')
  const [newProductBrandId, setNewProductBrandId] = useState('')

  // Local cache for product details (covers newly created products not yet in query results)
  const [productCache, setProductCache] = useState<Record<number, ProductInfo>>({})

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const { data: brandsData } = useQuery(BRANDS_QUERY)
  const { data: productsData, loading: productsLoading } = useQuery(PRODUCTS_QUERY, {
    variables: {
      categoryId: selectedCategoryId,
      name: debouncedSearch || undefined,
      limit: 50,
      sortBy: 'name',
      sortOrder: 'asc',
    },
  })
  const [suggestProduct, { loading: creating }] = useMutation(SUGGEST_PRODUCT_MUTATION)

  const categories = categoriesData?.categories || []
  const brands = brandsData?.brands || []
  const products: any[] = productsData?.products?.data || []
  const totalResults = productsData?.products?.meta?.total || 0

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Cache product details from query results
  useEffect(() => {
    if (products.length === 0) return
    const newEntries: Record<number, ProductInfo> = {}
    for (const p of products) {
      const shops = p.shops || []
      const availableShop = shops.find((s: any) => s.available && s.price)
      newEntries[p.id] = {
        id: p.id,
        name: p.name,
        category: p.category?.name,
        brand: p.brand?.name,
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : undefined,
        price: availableShop ? Number(availableShop.price) : undefined,
        currency: availableShop?.currency,
        shopCount: shops.filter((s: any) => s.available).length,
      }
    }
    setProductCache((prev) => ({ ...prev, ...newEntries }))
  }, [products])

  const getProductInfo = useCallback((productId: number): ProductInfo => {
    return productCache[productId] || { id: productId, name: `Product #${productId}` }
  }, [productCache])

  const handleToggle = (productId: number) => {
    const exists = selectedProducts.find((p) => p.productId === productId)
    if (exists) {
      onProductsChange(selectedProducts.filter((p) => p.productId !== productId))
    } else {
      onProductsChange([...selectedProducts, { productId, quantity: 1 }])
    }
  }

  const handleRemove = (productId: number) => {
    onProductsChange(selectedProducts.filter((p) => p.productId !== productId))
  }

  // Brand suggestions for new product
  const newProductBrandSuggestions = useMemo(() => {
    if (!newProductName || newProductBrandId) return []
    const nameLower = newProductName.toLowerCase()
    return brands.filter((b: any) => nameLower.includes(b.name.toLowerCase()))
  }, [newProductName, newProductBrandId, brands])

  const handleCreateProduct = async () => {
    if (!newProductName || !newProductCategoryId) {
      toast({ title: 'Name and category are required', variant: 'destructive' })
      return
    }
    try {
      const catId = parseInt(newProductCategoryId)
      const bId = newProductBrandId ? parseInt(newProductBrandId) : undefined
      const { data } = await suggestProduct({
        variables: { name: newProductName, categoryId: catId, brandId: bId },
      })
      const created = data?.suggestProduct
      if (created) {
        // Cache immediately so chips show the name
        const cat = categories.find((c: any) => c.id === catId)
        const brand = bId ? brands.find((b: any) => b.id === bId) : undefined
        setProductCache((prev) => ({
          ...prev,
          [created.id]: {
            id: created.id,
            name: created.name,
            category: cat?.name,
            brand: brand?.name,
          },
        }))
        onProductsChange([...selectedProducts, { productId: created.id, quantity: 1 }])
        toast({ title: `"${created.name}" created and added`, variant: 'success' })
      }
      setCreateOpen(false)
      setNewProductName('')
      setNewProductCategoryId('')
      setNewProductBrandId('')
    } catch {
      toast({ title: 'Failed to create product', variant: 'destructive' })
    }
  }

  const openCreateWithSearch = () => {
    setNewProductName(searchQuery)
    if (selectedCategoryId) setNewProductCategoryId(selectedCategoryId.toString())
    setCreateOpen(true)
  }

  const formatPrice = (price?: number, currency?: string) => {
    if (price == null) return null
    const sym = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
    return `${sym}${price.toFixed(2)}`
  }

  return (
    <div className="space-y-3">
      {/* Selected products */}
      {selectedProducts.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">{selectedProducts.length} selected</p>
          <div className="space-y-1.5">
            {selectedProducts.map((sp) => {
              const info = getProductInfo(sp.productId)
              return (
                <div
                  key={sp.productId}
                  className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-2"
                >
                  <div className="relative h-10 w-10 rounded-md bg-card overflow-hidden shrink-0 border border-border/50">
                    {info.image ? (
                      <Image src={info.image} alt={info.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{info.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {info.category && <span>{info.category}</span>}
                      {info.brand && <><span className="text-border">·</span><span>{info.brand}</span></>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(sp.productId)}
                    className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Search + Category filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-border bg-input pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={selectedCategoryId?.toString() || 'all'} onValueChange={(v) => setSelectedCategoryId(v === 'all' ? undefined : parseInt(v))}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count + create */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {productsLoading ? 'Searching...' : `${totalResults} product${totalResults !== 1 ? 's' : ''} found`}
        </p>
        <button
          type="button"
          onClick={openCreateWithSearch}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Create new product
        </button>
      </div>

      {/* Product list */}
      <div className="max-h-80 overflow-y-auto space-y-1 rounded-lg border border-border p-1.5">
        {products.length === 0 && !productsLoading && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No products found</p>
            <button
              type="button"
              onClick={openCreateWithSearch}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Create &ldquo;{searchQuery || 'new product'}&rdquo;
            </button>
          </div>
        )}
        {products.map((product: any) => {
          const isSelected = selectedProducts.some((p) => p.productId === product.id)
          const shops = product.shops || []
          const availableShop = shops.find((s: any) => s.available && s.price)
          const shopCount = shops.filter((s: any) => s.available).length
          const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => handleToggle(product.id)}
              className={`flex items-center gap-3 w-full text-left p-2 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Checkbox */}
              <div className={`flex items-center justify-center h-4 w-4 rounded border shrink-0 transition-colors ${
                isSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground/30'
              }`}>
                {isSelected && <Check className="h-3 w-3" />}
              </div>

              {/* Image */}
              <div className="relative h-10 w-10 rounded-md bg-card overflow-hidden shrink-0 border border-border/50">
                {image ? (
                  <Image src={image} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Tag className="h-3 w-3" />
                    {product.category?.name || '—'}
                  </span>
                  {product.brand && (
                    <><span className="text-border">·</span><span>{product.brand.name}</span></>
                  )}
                  {shopCount > 0 && (
                    <><span className="text-border">·</span><span className="flex items-center gap-0.5"><Store className="h-3 w-3" />{shopCount}</span></>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="shrink-0 text-right">
                {availableShop ? (
                  <span className="text-xs font-bold text-primary font-mono">
                    {formatPrice(Number(availableShop.price), availableShop.currency)}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/50">No price</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Create Product Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
            <DialogDescription>Add a new product to the catalog. It will be automatically added to your deal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Product Name</Label>
              <Input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="e.g. DJI Goggles 3" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={newProductCategoryId} onValueChange={setNewProductCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Brand (optional)</Label>
              <Select value={newProductBrandId} onValueChange={setNewProductBrandId}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {brands.map((brand: any) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newProductBrandSuggestions.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Detected:</span>
                  {newProductBrandSuggestions.map((brand: any) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => setNewProductBrandId(brand.id.toString())}
                      className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProduct} disabled={creating}>
              {creating ? 'Creating...' : 'Create & Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
