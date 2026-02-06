'use client'

import { useQuery } from '@apollo/client/react'
import { CATEGORIES_QUERY, SPEC_TYPES_QUERY, BRANDS_QUERY } from '../../graphql/queries'
import { Button, Checkbox, Label, Input, Separator } from '@nextrade/ui'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

interface FilterSidebarProps {
  categoryId?: number
  brandId?: number
  selectedSpecs: number[]
  searchQuery: string
  onCategoryChange: (id: number | undefined) => void
  onBrandChange: (id: number | undefined) => void
  onSpecToggle: (specId: number) => void
  onSearchChange: (query: string) => void
  onReset: () => void
}

export function FilterSidebar({
  categoryId,
  brandId,
  selectedSpecs,
  searchQuery,
  onCategoryChange,
  onBrandChange,
  onSpecToggle,
  onSearchChange,
  onReset,
}: FilterSidebarProps) {
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const { data: specTypesData } = useQuery(SPEC_TYPES_QUERY)
  const { data: brandsData } = useQuery(BRANDS_QUERY)

  const categories = categoriesData?.categories || []
  const specTypes = specTypesData?.specTypes || []
  const brands = brandsData?.brands || []

  const rootCategories = categories.filter((c: any) => !c.parentId)
  const hasFilters = categoryId || brandId || selectedSpecs.length > 0 || searchQuery

  return (
    <aside className="w-full max-w-xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="pl-9"
        />
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Categories</h4>
        <div className="space-y-1.5">
          <Button
            variant={!categoryId ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => onCategoryChange(undefined)}
          >
            All Categories
          </Button>
          {rootCategories.map((cat: any) => (
            <div key={cat.id}>
              <Button
                variant={categoryId === cat.id ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => onCategoryChange(cat.id)}
              >
                {cat.name}
              </Button>
              {cat.children?.map((child: any) => (
                <Button
                  key={child.id}
                  variant={categoryId === child.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className="w-full justify-start pl-6 text-muted-foreground"
                  onClick={() => onCategoryChange(child.id)}
                >
                  {child.name}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brands */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Brands</h4>
        <div className="space-y-1.5">
          <Button
            variant={!brandId ? 'secondary' : 'ghost'}
            size="sm"
            className="w-full justify-start"
            onClick={() => onBrandChange(undefined)}
          >
            All Brands
          </Button>
          {brands.map((brand: any) => (
            <Button
              key={brand.id}
              variant={brandId === brand.id ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => onBrandChange(brand.id)}
            >
              {brand.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Specifications */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Specifications</h4>
        {specTypes.map((specType: any) => (
          <div key={specType.id} className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{specType.label}</p>
            {specType.specs?.map((spec: any) => (
              <div key={spec.id} className="flex items-center gap-2">
                <Checkbox
                  id={`spec-${spec.id}`}
                  checked={selectedSpecs.includes(spec.id)}
                  onCheckedChange={() => onSpecToggle(spec.id)}
                />
                <Label htmlFor={`spec-${spec.id}`} className="text-sm cursor-pointer">
                  {spec.value}
                </Label>
              </div>
            ))}
          </div>
        ))}
      </div>
    </aside>
  )
}
