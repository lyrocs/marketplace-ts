'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { BRANDS_QUERY, CREATE_BRAND_MUTATION, DELETE_BRAND_MUTATION } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Skeleton } from '@nextrade/ui'
import { Plus, Trash2 } from 'lucide-react'

export default function AdminBrandsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [brandName, setBrandName] = useState('')
  const { toast } = useToast()

  const { data, loading, refetch } = useQuery(BRANDS_QUERY)
  const [createBrand] = useMutation(CREATE_BRAND_MUTATION)
  const [deleteBrand] = useMutation(DELETE_BRAND_MUTATION)

  const brands = data?.brands || []

  const handleCreate = async () => {
    if (!brandName.trim()) return
    try {
      await createBrand({ variables: { name: brandName.trim() } })
      toast({ title: 'Brand created', variant: 'success' })
      setBrandName('')
      setCreateOpen(false)
      await refetch()
    } catch {
      toast({ title: 'Failed to create brand', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this brand?')) return
    try {
      await deleteBrand({ variables: { id } })
      toast({ title: 'Brand deleted', variant: 'success' })
      await refetch()
    } catch {
      toast({ title: 'Failed to delete brand', variant: 'destructive' })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Brands</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Brand
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {brands.map((brand: any) => (
                  <div key={brand.id} className="flex items-center justify-between px-4 py-3">
                    <span className="font-medium">{brand.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {brands.length === 0 && <p className="text-center text-muted-foreground py-8">No brands yet</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
            <DialogDescription>Create a new product brand</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Brand Name</Label>
            <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Apple" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Brand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
