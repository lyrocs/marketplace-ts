'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { PRODUCTS_QUERY, CREATE_PRODUCT_MUTATION, DELETE_PRODUCT_MUTATION, CATEGORIES_QUERY, BRANDS_QUERY } from '@/graphql/queries'
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
} from '@nextrade/ui'
import { Plus, Trash2 } from 'lucide-react'
import { Pagination } from '@/components/shared/pagination'

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [searchName, setSearchName] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', categoryId: '', brandId: '', description: '' })
  const { toast } = useToast()

  const { data, loading, refetch } = useQuery(PRODUCTS_QUERY, {
    variables: { name: searchName || undefined, page, limit: 20 },
  })
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const { data: brandsData } = useQuery(BRANDS_QUERY)
  const [createProduct] = useMutation(CREATE_PRODUCT_MUTATION)
  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION)

  const products = data?.products?.data || []
  const meta = data?.products?.meta

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
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
    </div>
  )
}
