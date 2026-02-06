'use client'

import { Button } from '@nextrade/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter((p) => {
    if (p === 1 || p === totalPages) return true
    if (Math.abs(p - currentPage) <= 1) return true
    return false
  })

  return (
    <div className="flex items-center justify-center gap-1">
      <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page, i) => (
        <>
          {i > 0 && visiblePages[i] - visiblePages[i - 1] > 1 && (
            <span className="px-2 text-muted-foreground">…</span>
          )}
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        </>
      ))}

      <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
