'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { BRANDS_QUERY, CREATE_BRAND_MUTATION, UPDATE_BRAND_MUTATION, DELETE_BRAND_MUTATION } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Skeleton } from '@nextrade/ui'
import { Plus, Trash2, Edit } from 'lucide-react'

export default function AdminBrandsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [brandName, setBrandName] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editBrand, setEditBrand] = useState({ id: 0, name: '' })
  const { toast } = useToast()

  const { data, loading, refetch } = useQuery(BRANDS_QUERY)
  const [createBrand] = useMutation(CREATE_BRAND_MUTATION)
  const [updateBrand] = useMutation(UPDATE_BRAND_MUTATION)
  const [deleteBrand] = useMutation(DELETE_BRAND_MUTATION)

  const brands = data?.brands || []

  const openEditDialog = (brand: any) => {
    setEditBrand({ id: brand.id, name: brand.name })
    setEditOpen(true)
  }

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

  const handleUpdate = async () => {
    if (!editBrand.name.trim()) return
    try {
      await updateBrand({ variables: { id: editBrand.id, name: editBrand.name.trim() } })
      toast({ title: 'Brand updated', variant: 'success' })
      setEditOpen(false)
      await refetch()
    } catch {
      toast({ title: 'Failed to update brand', variant: 'destructive' })
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
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(brand)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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

      {/* Edit Brand Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>Update brand name</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Brand Name</Label>
            <Input value={editBrand.name} onChange={(e) => setEditBrand({ ...editBrand, name: e.target.value })} placeholder="Apple" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Brand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
