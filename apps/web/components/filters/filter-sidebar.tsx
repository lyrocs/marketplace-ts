'use client'

import { useState } from 'react'
import {
  Input,
  Button,
  Checkbox,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@nextrade/ui'
import { Search, X } from 'lucide-react'

interface Spec {
  id: number
  value: string
}

interface SpecType {
  id: number
  key: string
  label: string
  specs: Spec[]
}

interface Category {
  id: number
  name: string
  key: string
  parentId?: number | null
}

interface FilterSidebarProps {
  title?: string
  specs: SpecType[]
  selectedSpecIds: number[]
  categories: Category[]
  currentCategoryId?: number
  searchValue: string
  onFilterChange: (specIds: number[]) => void
  onSearchChange: (search: string) => void
  onCategoryChange: (categoryId: number) => void
}

export function FilterSidebar({
  title = 'Filters',
  specs,
  selectedSpecIds,
  categories,
  currentCategoryId,
  searchValue,
  onFilterChange,
  onSearchChange,
  onCategoryChange,
}: FilterSidebarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)

  const handleSpecToggle = (specId: number) => {
    const newSelection = selectedSpecIds.includes(specId)
      ? selectedSpecIds.filter((id) => id !== specId)
      : [...selectedSpecIds, specId]
    onFilterChange(newSelection)
  }

  const handleReset = () => {
    onFilterChange([])
    setLocalSearch('')
    onSearchChange('')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(localSearch)
  }

  // Group specs by type
  const hasActiveFilters = selectedSpecIds.length > 0

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Category Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={currentCategoryId?.toString()}
            onValueChange={(value) => onCategoryChange(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((cat) => cat.parentId === null)
                .map((parentCat) => (
                  <div key={parentCat.id}>
                    <SelectItem value={parentCat.id.toString()} className="font-semibold">
                      {parentCat.name}
                    </SelectItem>
                    {categories
                      .filter((cat) => cat.parentId === parentCat.id)
                      .map((childCat) => (
                        <SelectItem key={childCat.id} value={childCat.id.toString()} className="pl-6">
                          {childCat.name}
                        </SelectItem>
                      ))}
                  </div>
                ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" onClick={handleReset} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear Filters ({selectedSpecIds.length})
        </Button>
      )}

      {/* Spec Type Filters */}
      {specs.map((specType) => (
        <Card key={specType.id}>
          <CardHeader>
            <CardTitle className="text-sm">{specType.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {specType.specs.map((spec) => (
              <div key={spec.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`spec-${spec.id}`}
                  checked={selectedSpecIds.includes(spec.id)}
                  onCheckedChange={() => handleSpecToggle(spec.id)}
                />
                <Label
                  htmlFor={`spec-${spec.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {spec.value}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
