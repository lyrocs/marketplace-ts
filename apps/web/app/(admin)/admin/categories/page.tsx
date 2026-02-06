'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { CATEGORIES_QUERY, CREATE_CATEGORY_MUTATION, DELETE_CATEGORY_MUTATION } from '@/graphql/queries'
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
} from '@nextrade/ui'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [newCategory, setNewCategory] = useState({ name: '', key: '', parentId: '', description: '' })
  const { toast } = useToast()

  const { data, loading, refetch } = useQuery(CATEGORIES_QUERY)
  const [createCategory] = useMutation(CREATE_CATEGORY_MUTATION)
  const [deleteCategory] = useMutation(DELETE_CATEGORY_MUTATION)

  const categories = data?.categories || []
  const rootCategories = categories.filter((c: any) => !c.parentId)

  const toggleExpand = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleCreate = async () => {
    if (!newCategory.name || !newCategory.key) {
      toast({ title: 'Name and key are required', variant: 'destructive' })
      return
    }
    try {
      await createCategory({
        variables: {
          name: newCategory.name,
          key: newCategory.key,
          parentId: newCategory.parentId ? parseInt(newCategory.parentId) : undefined,
          description: newCategory.description || undefined,
        },
      })
      toast({ title: 'Category created', variant: 'success' })
      setCreateOpen(false)
      setNewCategory({ name: '', key: '', parentId: '', description: '' })
      await refetch()
    } catch {
      toast({ title: 'Failed to create category', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? This may affect products.')) return
    try {
      await deleteCategory({ variables: { id } })
      toast({ title: 'Category deleted', variant: 'success' })
      await refetch()
    } catch {
      toast({ title: 'Failed to delete category', variant: 'destructive' })
    }
  }

  const renderCategory = (category: any, depth = 0) => {
    const children = categories.filter((c: any) => c.parentId === category.id)
    const hasChildren = children.length > 0
    const isExpanded = expanded[category.id]

    return (
      <div key={category.id}>
        <div className="flex items-center gap-2 py-2 rounded-lg hover:bg-muted px-3" style={{ paddingLeft: `${12 + depth * 24}px` }}>
          {hasChildren ? (
            <button onClick={() => toggleExpand(category.id)} className="text-muted-foreground">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-4" />
          )}
          <span className="flex-1 text-sm font-medium">{category.name}</span>
          <Badge variant="outline" className="text-xs">{category.key}</Badge>
          <span className="text-xs text-muted-foreground">{category.specTypes?.length || 0} specs</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(category.id)}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
        {isExpanded && children.map((child: any) => renderCategory(child, depth + 1))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (
          <Card>
            <CardContent className="pt-4">
              {rootCategories.map((cat: any) => renderCategory(cat))}
              {rootCategories.length === 0 && (
                <p className="text-center text-muted-foreground py-6">No categories yet</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="Electronics" />
            </div>
            <div className="space-y-1.5">
              <Label>Key (URL slug)</Label>
              <Input
                value={newCategory.key}
                onChange={(e) => setNewCategory({ ...newCategory, key: e.target.value })}
                placeholder="electronics"
                onBlur={() => { if (!newCategory.key && newCategory.name) setNewCategory({ ...newCategory, key: newCategory.name.toLowerCase().replace(/\s+/g, '-') }) }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parent Category (optional)</Label>
              <Select value={newCategory.parentId} onValueChange={(v) => setNewCategory({ ...newCategory, parentId: v })}>
                <SelectTrigger><SelectValue placeholder="Root category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
