'use client'

import { Badge } from '@nextrade/ui'
import { X } from 'lucide-react'

interface ActiveFilter {
  label: string
  value: string
  onRemove: () => void
}

interface ActiveFiltersProps {
  filters: ActiveFilter[]
  onClearAll?: () => void
}

export function ActiveFilters({ filters, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
      {filters.map((filter, index) => (
        <Badge
          key={index}
          variant="secondary"
          className="cursor-pointer hover:bg-secondary/80"
          onClick={filter.onRemove}
        >
          {filter.label}: {filter.value}
          <X className="ml-1 h-3 w-3" />
        </Badge>
      ))}
      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-primary hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
