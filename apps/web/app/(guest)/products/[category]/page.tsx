'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { DEALS_QUERY, CATEGORY_BY_KEY_QUERY } from '@/graphql/queries'
import { FilterSidebar } from '@/components/filters/filter-sidebar'
import { DealCard } from '@/components/cards/deal-card'
import { Pagination } from '@/components/shared/pagination'
import { Skeleton } from '@nextrade/ui'

export default function ProductListingPage() {
  const params = useParams()
  const categoryKey = params.category as string

  const [page, setPage] = useState(1)
  const [selectedSpecs, setSelectedSpecs] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>()

  const { data: categoryData } = useQuery(CATEGORY_BY_KEY_QUERY, {
    variables: { key: categoryKey },
  })

  const category = categoryData?.categoryByKey

  const { data: dealsData, loading } = useQuery(DEALS_QUERY, {
    variables: {
      title: searchQuery || undefined,
      categoryId: category?.id,
      specIds: selectedSpecs.length > 0 ? selectedSpecs : undefined,
      page,
      limit: 12,
    },
  })

  const deals = dealsData?.deals?.data || []
  const meta = dealsData?.deals?.meta

  useEffect(() => {
    setPage(1)
  }, [categoryKey, searchQuery, selectedSpecs])

  const handleSpecToggle = (specId: number) => {
    setSelectedSpecs((prev) =>
      prev.includes(specId) ? prev.filter((id) => id !== specId) : [...prev, specId]
    )
  }

  const handleReset = () => {
    setSelectedSpecs([])
    setSearchQuery('')
    setSelectedBrandId(undefined)
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{category?.name || 'All Products'}</h1>
        {category?.description && <p className="text-muted-foreground mt-1">{category.description}</p>}
        {meta && <p className="text-sm text-muted-foreground">{meta.total} listings found</p>}
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <FilterSidebar
            categoryId={category?.id}
            brandId={selectedBrandId}
            selectedSpecs={selectedSpecs}
            searchQuery={searchQuery}
            onCategoryChange={() => {}}
            onBrandChange={setSelectedBrandId}
            onSpecToggle={handleSpecToggle}
            onSearchChange={setSearchQuery}
            onReset={handleReset}
          />
        </aside>

        {/* Deal Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border bg-muted/50">
              <p className="text-lg font-medium text-muted-foreground">No deals found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal: any) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
              {meta && meta.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination currentPage={page} totalPages={meta.totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
