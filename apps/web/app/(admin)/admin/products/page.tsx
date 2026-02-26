'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { PRODUCTS_QUERY, CREATE_PRODUCT_MUTATION, UPDATE_PRODUCT_MUTATION, UPDATE_PRODUCT_SPECS_MUTATION, ADD_PRODUCT_IMAGE_MUTATION, DELETE_PRODUCT_MUTATION, CATEGORIES_QUERY, BRANDS_QUERY, SPEC_TYPES_QUERY } from '@/graphql/queries'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Skeleton,
  Checkbox,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@marketplace/ui'
import { Plus, Trash2, Eye, Edit, EyeOff, CheckCheck, Package } from 'lucide-react'
import { Pagination } from '@/components/shared/pagination'
import Link from 'next/link'

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [searchName, setSearchName] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', categoryId: '', brandId: '', description: '', specIds: [] as number[], images: [] as string[] })
  const [hoverImage, setHoverImage] = useState<{ src: string; x: number; y: number } | null>(null)
  const { toast } = useToast()

  const handleImageHover = useCallback((e: React.MouseEvent, src: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setHoverImage({ src, x: rect.right + 8, y: rect.top + rect.height / 2 })
  }, [])

  const { data, loading, refetch } = useQuery(PRODUCTS_QUERY, {
    variables: {
      name: searchName || undefined,
      page,
      limit: 20,
      includeDrafts: true,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    },
    fetchPolicy: 'network-only',
  })
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const { data: brandsData } = useQuery(BRANDS_QUERY)
  const { data: specTypesData } = useQuery(SPEC_TYPES_QUERY)
  const [createProduct] = useMutation(CREATE_PRODUCT_MUTATION)
  const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION)
  const [updateProductSpecs] = useMutation(UPDATE_PRODUCT_SPECS_MUTATION)
  const [addProductImage] = useMutation(ADD_PRODUCT_IMAGE_MUTATION)
  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION)

  const products = data?.products?.data || []
  const meta = data?.products?.meta
  const specTypes = specTypesData?.specTypes || []
  const categories = categoriesData?.categories || []
  const brands = brandsData?.brands || []

  // Get spec types for selected category (for create dialog)
  const selectedCategory = categories.find((c: any) => c.id === parseInt(newProduct.categoryId))
  const availableSpecTypeIds = selectedCategory?.specTypes?.map((st: any) => st.id) || []
  const availableSpecTypes = specTypes.filter((st: any) => availableSpecTypeIds.includes(st.id))

  const newProductBrandSuggestions = useMemo(
    () => !newProduct.brandId ? brands.filter((b: any) => newProduct.name && newProduct.name.toLowerCase().includes(b.name.toLowerCase())) : [],
    [newProduct.name, newProduct.brandId, brands]
  )

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.categoryId) {
      toast({ title: 'Name and category are required', variant: 'destructive' })
      return
    }
    try {
      const { data } = await createProduct({
        variables: {
          name: newProduct.name,
          categoryId: parseInt(newProduct.categoryId),
          brandId: newProduct.brandId ? parseInt(newProduct.brandId) : undefined,
          description: newProduct.description || undefined,
        },
      })

      const productId = data?.createProduct?.id

      if (productId && newProduct.images.length > 0) {
        for (const imageUrl of newProduct.images) {
          await addProductImage({ variables: { productId, imageUrl } })
        }
      }

      if (productId && newProduct.specIds.length > 0) {
        await updateProductSpecs({ variables: { productId, specIds: newProduct.specIds } })
      }

      toast({ title: 'Product created', variant: 'success' })
      setCreateOpen(false)
      setNewProduct({ name: '', categoryId: '', brandId: '', description: '', specIds: [], images: [] })
      await refetch()
    } catch {
      toast({ title: 'Failed to create product', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct({ variables: { id } })
      toast({ title: 'Product deleted', variant: 'success' })
      await refetch()
    } catch {
      toast({ title: 'Failed to delete product', variant: 'destructive' })
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextStatus: Record<string, string> = { active: 'draft', draft: 'active', ignored: 'draft' }
    const newStatus = nextStatus[currentStatus] || 'active'
    try {
      await updateProduct({ variables: { id, status: newStatus } })
      toast({ title: `Status changed to ${newStatus}`, variant: 'success' })
      await refetch()
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  const handleActivateAll = async () => {
    const drafts = products.filter((p: any) => p.status === 'draft')
    if (drafts.length === 0) return
    try {
      await Promise.all(
        drafts.map((p: any) => updateProduct({ variables: { id: p.id, status: 'active' } }))
      )
      toast({ title: `${drafts.length} product(s) activated`, variant: 'success' })
      await refetch()
    } catch {
      toast({ title: 'Failed to activate some products', variant: 'destructive' })
      await refetch()
    }
  }

  const handleIgnoreProduct = async (id: number) => {
    try {
      await updateProduct({ variables: { id, status: 'ignored' } })
      toast({ title: 'Product ignored', variant: 'success' })
      await refetch()
    } catch {
      toast({ title: 'Failed to ignore product', variant: 'destructive' })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }} className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="ignored">Ignored</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3">
            {statusFilter === 'draft' && products.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleActivateAll}>
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Activate all
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {meta?.total || 0} products
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Input
            placeholder="Search products..."
            value={searchName}
            onChange={(e) => { setSearchName(e.target.value); setPage(1) }}
            className="max-w-sm"
          />
        </div>

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-left font-semibold">Category</th>
                      <th className="px-4 py-3 text-left font-semibold">Brand</th>
                      <th className="px-4 py-3 text-left font-semibold">Shops</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => (
                      <tr key={product.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">
                          <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                            <div
                              className="h-20 w-20 flex-shrink-0 rounded-md border border-border/50 bg-muted overflow-hidden"
                              onMouseEnter={(e) => product.images?.[0] && handleImageHover(e, product.images[0])}
                              onMouseLeave={() => setHoverImage(null)}
                            >
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-4 w-4 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(product.id, product.status)}
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
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{product.category?.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{product.brand?.name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{product.shops?.length || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/products/${product.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            {product.status !== 'ignored' && (
                              <Button variant="ghost" size="icon" onClick={() => handleIgnoreProduct(product.id)} title="Ignore product">
                                <EyeOff className="h-4 w-4 text-amber-500" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="mt-6">
            <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>Create a new product in the catalog</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Product Name</Label>
              <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <Label>Product Images</Label>
              <ImageUpload
                images={newProduct.images}
                onImageAdded={(url) => setNewProduct({ ...newProduct, images: [...newProduct.images, url] })}
                onImageRemoved={(url) => setNewProduct({ ...newProduct, images: newProduct.images.filter(img => img !== url) })}
                maxImages={10}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={newProduct.categoryId} onValueChange={(v) => setNewProduct({ ...newProduct, categoryId: v, specIds: [] })}>
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
              <Select value={newProduct.brandId} onValueChange={(v) => setNewProduct({ ...newProduct, brandId: v })}>
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
                      onClick={() => setNewProduct({ ...newProduct, brandId: brand.id.toString() })}
                      className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
            </div>

            {/* Specifications - only show if category is selected */}
            {newProduct.categoryId && availableSpecTypes.length > 0 && (
              <div className="space-y-3">
                <Label>Specifications (optional)</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                  {availableSpecTypes.map((specType: any) => (
                    <div key={specType.id} className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">{specType.label}</p>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        {specType.specs?.map((spec: any) => (
                          <div key={spec.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`new-spec-${spec.id}`}
                              checked={newProduct.specIds.includes(spec.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewProduct({ ...newProduct, specIds: [...newProduct.specIds, spec.id] })
                                } else {
                                  setNewProduct({ ...newProduct, specIds: newProduct.specIds.filter(id => id !== spec.id) })
                                }
                              }}
                            />
                            <label htmlFor={`new-spec-${spec.id}`} className="text-sm cursor-pointer">
                              {spec.value}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image hover preview */}
      {hoverImage && (
        <div
          className="pointer-events-none fixed z-50 h-48 w-48 rounded-lg border border-border bg-card shadow-xl overflow-hidden"
          style={{ left: hoverImage.x, top: hoverImage.y, transform: 'translateY(-50%)' }}
        >
          <img src={hoverImage.src} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  )
}
