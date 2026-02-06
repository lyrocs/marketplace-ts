'use client'

import { useQuery } from '@apollo/client/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PRODUCTS_QUERY, DEALS_QUERY, CATEGORIES_QUERY, SPEC_TYPES_QUERY } from '@/graphql/queries'
import { FilterSidebar } from '@/components/filters/filter-sidebar'
import { ProductCard } from '@/components/cards/product-card'
import { DealCard } from '@/components/cards/deal-card'
import { PageBanner } from '@/components/shared/page-banner'
import { ToggleSwitch } from '@/components/shared/toggle-switch'
import { Pagination } from '@/components/shared/pagination'
import { Skeleton } from '@nextrade/ui'

export default function AllProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const isDeal = searchParams.get('type') === 'deal'
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || undefined
  const specsParam = searchParams.get('specs')
  const specIds = specsParam ? specsParam.split(',').map(Number) : undefined
  const categoryIdParam = searchParams.get('categoryId')
  const categoryId = categoryIdParam ? parseInt(categoryIdParam) : undefined

  // Fetch all categories for sidebar dropdown
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY)
  const categories = categoriesData?.categories || []

  // Fetch products or deals
  const { data: productsData, loading: productsLoading } = useQuery(
    isDeal ? DEALS_QUERY : PRODUCTS_QUERY,
    {
      variables: {
        categoryId,
        title: search,
        name: search,
        specIds,
        page,
        limit: 12,
      },
    }
  )

  // Fetch specs for filtering
  const { data: specsData } = useQuery(SPEC_TYPES_QUERY)
  const specs = specsData?.specTypes || []

  const items = isDeal
    ? productsData?.deals?.data || []
    : productsData?.products?.data || []
  const meta = isDeal ? productsData?.deals?.meta : productsData?.products?.meta

  const handleFilterChange = (newSpecIds: number[]) => {
    const url = new URL(window.location.href)
    url.searchParams.delete('page')
    url.searchParams.delete('specs')
    if (newSpecIds.length > 0) {
      url.searchParams.set('specs', newSpecIds.join(','))
    }
    router.push(url.pathname + url.search)
  }

  const handleSearchChange = (newSearch: string) => {
    const url = new URL(window.location.href)
    url.searchParams.delete('page')
    if (newSearch) {
      url.searchParams.set('search', newSearch)
    } else {
      url.searchParams.delete('search')
    }
    router.push(url.pathname + url.search)
  }

  const handleCategoryChange = (categoryId: number) => {
    const category = categories.find((cat: any) => cat.id === categoryId)
    if (category) {
      router.push(`/products/${category.key.toLowerCase()}${isDeal ? '?type=deal' : ''}`)
    }
  }

  const handlePageChange = (newPage: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', newPage.toString())
    router.push(url.pathname + url.search)
  }

  const handleToggleNew = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('type')
    router.push(url.pathname + url.search)
  }

  const handleToggleDeal = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('type', 'deal')
    router.push(url.pathname + url.search)
  }

  return (
    <main className="container mx-auto px-4 py-2">
      {/* Page Banner */}
      <PageBanner
        title={isDeal ? 'All Used Deals' : 'All Products'}
        description={
          isDeal
            ? 'Browse all available deals on used equipment'
            : 'Browse our complete catalog of professional equipment'
        }
      >
        <ToggleSwitch
          leftLabel="Used Deals"
          rightLabel="New Products"
          isLeftActive={isDeal}
          onClickLeft={handleToggleDeal}
          onClickRight={handleToggleNew}
        />
      </PageBanner>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 lg:gap-x-12 mt-6">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-1">
          <FilterSidebar
            title="Filters"
            specs={specs}
            selectedSpecIds={specIds || []}
            categories={categories}
            currentCategoryId={categoryId}
            searchValue={search || ''}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        {/* Products/Deals Grid */}
        <div className="mt-8 lg:col-span-2 xl:col-span-3 2xl:col-span-4 lg:mt-0">
          {productsLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mb-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {isDeal ? 'No deals found' : 'No products found'}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mb-6">
                {isDeal
                  ? items.map((deal: any) => <DealCard key={deal.id} deal={deal} />)
                  : items.map((product: any) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <Pagination
                  currentPage={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
