'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { PRODUCTS_QUERY, PRODUCT_QUERY, CREATE_PRODUCT_MUTATION, UPDATE_PRODUCT_MUTATION, UPDATE_PRODUCT_SPECS_MUTATION, DELETE_PRODUCT_MUTATION, CATEGORIES_QUERY, BRANDS_QUERY, SPEC_TYPES_QUERY } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
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
  Badge,
  Textarea,
  Checkbox,
} from '@nextrade/ui'
import { Plus, Trash2, Eye, Edit } from 'lucide-react'
import { Pagination } from '@/components/shared/pagination'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [searchName, setSearchName] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', categoryId: '', brandId: '', description: '' })
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editProduct, setEditProduct] = useState({ id: 0, name: '', categoryId: '', description: '', specIds: [] as number[] })
  const { toast } = useToast()

  const { data, loading, refetch } = useQuery(PRODUCTS_QUERY, {
    variables: { name: searchName || undefined, page, limit: 20 },
  })
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const { data: brandsData } = useQuery(BRANDS_QUERY)
  const { data: specTypesData } = useQuery(SPEC_TYPES_QUERY)
  const { data: productData, loading: productLoading } = useQuery(PRODUCT_QUERY, {
    variables: { id: selectedProductId },
    skip: !selectedProductId,
  })
  const [createProduct] = useMutation(CREATE_PRODUCT_MUTATION)
  const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION)
  const [updateProductSpecs] = useMutation(UPDATE_PRODUCT_SPECS_MUTATION)
  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION)

  const products = data?.products?.data || []
  const meta = data?.products?.meta
  const product = productData?.product
  const specTypes = specTypesData?.specTypes || []

  const openEditDialog = (product: any) => {
    setEditProduct({
      id: product.id,
      name: product.name,
      categoryId: (product.categoryId || product.category?.id || '').toString(),
      description: product.description || '',
      specIds: product.specs?.map((s: any) => s.id) || [],
    })
    setEditOpen(true)
  }

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.categoryId) {
      toast({ title: 'Name and category are required', variant: 'destructive' })
      return
    }
    try {
      await createProduct({
        variables: {
          name: newProduct.name,
          categoryId: parseInt(newProduct.categoryId),
          brandId: newProduct.brandId ? parseInt(newProduct.brandId) : undefined,
          description: newProduct.description || undefined,
        },
      })
      toast({ title: 'Product created', variant: 'success' })
      setCreateOpen(false)
      setNewProduct({ name: '', categoryId: '', brandId: '', description: '' })
      await refetch()
    } catch {
      toast({ title: 'Failed to create product', variant: 'destructive' })
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
          description: editProduct.description || undefined,
        },
      })
      // Update specs separately
      await updateProductSpecs({
        variables: {
          productId: editProduct.id,
          specIds: editProduct.specIds,
        },
      })
      toast({ title: 'Product updated', variant: 'success' })
      setEditOpen(false)
      setSelectedProductId(null)
      await refetch()
    } catch {
      toast({ title: 'Failed to update product', variant: 'destructive' })
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="mt-4 flex items-center gap-3">
        <Input
          placeholder="Search products..."
          value={searchName}
          onChange={(e) => { setSearchName(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">
          {meta?.total || 0} products
        </span>
      </div>

      {/* Product Table */}
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
                      <th className="px-4 py-3 text-left font-semibold">Category</th>
                      <th className="px-4 py-3 text-left font-semibold">Brand</th>
                      <th className="px-4 py-3 text-left font-semibold">Shops</th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => (
                      <tr key={product.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{product.category?.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{product.brand?.name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{product.shops?.length || 0}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedProductId(product.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
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
              <Label>Category</Label>
              <Select value={newProduct.categoryId} onValueChange={(v) => setNewProduct({ ...newProduct, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {(categoriesData?.categories || []).map((cat: any) => (
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
                  {(brandsData?.brands || []).map((brand: any) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={!!selectedProductId && !editOpen} onOpenChange={(open) => !open && setSelectedProductId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{productLoading ? 'Loading...' : (product?.name || 'Product Details')}</DialogTitle>
            {!productLoading && product && (
              <div className="flex items-center gap-2 mt-2">
                <Badge>{product.status}</Badge>
                <span className="text-sm text-muted-foreground">
                  {product.category?.name} {product.brand && `· ${product.brand.name}`}
                </span>
              </div>
            )}
          </DialogHeader>

          {productLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : product ? (
            <>

              <div className="space-y-6 mt-4">
                {/* Images */}
                {product.images && product.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Images</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {product.images.map((img: string, i: number) => (
                        <div key={i} className="relative h-32 rounded-lg overflow-hidden border">
                          <Image src={img} alt={`Product image ${i + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}

                {/* Specifications */}
                {product.specs && product.specs.length > 0 && (
                  <div>
                    <Label>Specifications</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {product.specs.map((spec: any) => (
                        <div key={spec.id} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm font-medium">{spec.specType?.label}:</span>
                          <Badge variant="secondary">{spec.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shop Links */}
                {product.shops && product.shops.length > 0 && (
                  <div>
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
                  </div>
                )}

                {/* Metadata */}
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
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setSelectedProductId(null)}>Close</Button>
                <Link href={`/product/${product.id}`} target="_blank">
                  <Button variant="outline">View Public Page</Button>
                </Link>
                <Button onClick={() => {
                  openEditDialog(product)
                }}>
                  <Edit className="mr-1 h-4 w-4" /> Edit
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Product Name</Label>
              <Input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={editProduct.categoryId} onValueChange={(v) => setEditProduct({ ...editProduct, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {(categoriesData?.categories || []).map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                rows={4}
              />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
