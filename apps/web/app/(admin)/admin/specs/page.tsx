'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { SPEC_TYPES_QUERY, CREATE_SPEC_TYPE_MUTATION, CREATE_SPEC_MUTATION, DELETE_SPEC_MUTATION, DELETE_SPEC_TYPE_MUTATION } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Skeleton,
  Badge,
} from '@marketplace/ui'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

export default function AdminSpecsPage() {
  const [createTypeOpen, setCreateTypeOpen] = useState(false)
  const [addSpecTypeId, setAddSpecTypeId] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [newType, setNewType] = useState({ key: '', label: '', description: '' })
  const [newSpecValue, setNewSpecValue] = useState('')
  const { toast } = useToast()

  const { data, loading, refetch } = useQuery(SPEC_TYPES_QUERY)
  const [createSpecType] = useMutation(CREATE_SPEC_TYPE_MUTATION)
  const [createSpec] = useMutation(CREATE_SPEC_MUTATION)
  const [deleteSpec] = useMutation(DELETE_SPEC_MUTATION)
  const [deleteSpecType] = useMutation(DELETE_SPEC_TYPE_MUTATION)

  const specTypes = (data as any)?.specTypes || []

  const handleCreateType = async () => {
    if (!newType.key || !newType.label) return
    try {
      await createSpecType({ variables: newType })
      toast({ title: 'Spec type created', variant: 'success' })
      setCreateTypeOpen(false)
      setNewType({ key: '', label: '', description: '' })
      await refetch()
    } catch {
      toast({ title: 'Failed to create spec type', variant: 'destructive' })
    }
  }

  const handleAddSpec = async () => {
    if (!addSpecTypeId || !newSpecValue.trim()) return
    try {
      await createSpec({ variables: { specTypeId: addSpecTypeId, value: newSpecValue.trim() } })
      toast({ title: 'Spec value added', variant: 'success' })
      setNewSpecValue('')
      setAddSpecTypeId(null)
      await refetch()
    } catch {
      toast({ title: 'Failed to add spec', variant: 'destructive' })
    }
  }

  const handleDeleteSpec = async (id: number) => {
    try {
      await deleteSpec({ variables: { id } })
      toast({ title: 'Spec deleted', variant: 'success' })
      await refetch()
    } catch {
      toast({ title: 'Failed to delete spec', variant: 'destructive' })
    }
  }

  const handleDeleteType = async (id: number) => {
    if (!confirm('Delete this spec type and all its values?')) return
    try {
      await deleteSpecType({ variables: { id } })
      toast({ title: 'Spec type deleted', variant: 'success' })
      await refetch()
    } catch {
      toast({ title: 'Failed to delete spec type', variant: 'destructive' })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Specifications</h1>
        <Button onClick={() => setCreateTypeOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Spec Type
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
        ) : specTypes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No spec types yet</p>
            </CardContent>
          </Card>
        ) : (
          specTypes.map((specType: any) => (
            <Card key={specType.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setExpanded((prev) => ({ ...prev, [specType.id]: !prev[specType.id] }))}>
                      {expanded[specType.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <h3 className="font-semibold">{specType.label}</h3>
                    <Badge variant="outline" className="text-xs">{specType.key}</Badge>
                    <Badge variant="secondary" className="text-xs">{specType.specs?.length || 0} values</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setAddSpecTypeId(specType.id)}>
                      <Plus className="mr-1 h-3 w-3" /> Add Value
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteType(specType.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {(expanded[specType.id] || addSpecTypeId === specType.id) && (
                  <div className="mt-3 pl-6">
                    <div className="flex flex-wrap gap-2">
                      {specType.specs?.map((spec: any) => (
                        <div key={spec.id} className="flex items-center gap-1 rounded-full border bg-muted/50 px-3 py-1">
                          <span className="text-sm">{spec.value}</span>
                          <button onClick={() => handleDeleteSpec(spec.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {addSpecTypeId === specType.id && (
                      <div className="flex items-center gap-2 mt-3">
                        <Input
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                          placeholder="New value..."
                          className="max-w-xs"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddSpec()}
                        />
                        <Button size="sm" onClick={handleAddSpec}>Add</Button>
                        <Button size="sm" variant="outline" onClick={() => { setAddSpecTypeId(null); setNewSpecValue('') }}>Cancel</Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Spec Type Dialog */}
      <Dialog open={createTypeOpen} onOpenChange={setCreateTypeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Specification Type</DialogTitle>
            <DialogDescription>Define a new specification category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Key</Label>
              <Input value={newType.key} onChange={(e) => setNewType({ ...newType, key: e.target.value })} placeholder="storage" />
            </div>
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={newType.label} onChange={(e) => setNewType({ ...newType, label: e.target.value })} placeholder="Storage Capacity" />
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <Input value={newType.description} onChange={(e) => setNewType({ ...newType, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTypeOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateType}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
