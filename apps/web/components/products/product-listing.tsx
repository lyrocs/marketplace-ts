'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { PRODUCTS_QUERY, DEALS_QUERY } from '@/graphql/queries'
import { FilterSidebar } from '@/components/filters/filter-sidebar'
import { ActiveFilters } from '@/components/filters/active-filters'
import { ProductCard } from '@/components/cards/product-card'
import { DealCard } from '@/components/cards/deal-card'
import { PageBanner } from '@/components/shared/page-banner'
import { ToggleSwitch } from '@/components/shared/toggle-switch'
import { Pagination } from '@/components/shared/pagination'
import {
  Skeleton,
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  ScrollArea,
} from '@marketplace/ui'

interface ProductListingProps {
  categoryKey?: string
  categories: any[]
  brands: any[]
  specTypes: any[]
}

export function ProductListing({ categoryKey, categories, brands, specTypes }: ProductListingProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const isDeal = searchParams.get('type') === 'deal'
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || undefined
  const specsParam = searchParams.get('specs')
  const specIds = specsParam ? specsParam.split(',').map(Number) : undefined
  const categoryIdParam = searchParams.get('categoryId')
  const categoryId = categoryIdParam ? parseInt(categoryIdParam) : undefined
  const brandId = searchParams.get('brandId') ? parseInt(searchParams.get('brandId')!) : undefined
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  // Resolve category from key if provided
  const currentCategory = categoryKey
    ? categories.find((cat: any) => cat.key.toLowerCase() === categoryKey.toLowerCase())
    : undefined

  // Get category IDs to filter by (include subcategories if parent category)
  const categoryIdsToFilter = currentCategory
    ? [
        currentCategory.id,
        ...categories
          .filter((cat: any) => cat.parentId === currentCategory.id)
          .map((cat: any) => cat.id),
      ]
    : []

  // Use first category ID for the query (backend doesn't support multiple yet)
  const categoryIdForQuery = categoryKey ? categoryIdsToFilter[0] : categoryId

  const hasSubcategories = categoryKey
    ? categories.some((cat: any) => cat.parentId === currentCategory?.id)
    : false

  // Fetch products or deals
  const skipQuery = categoryKey ? !categoryIdForQuery : false
  const { data: dealsData, loading: dealsLoading } = useQuery(DEALS_QUERY, {
    variables: {
      categoryId: categoryIdForQuery,
      title: search,
      specIds,
      page,
      limit: 12,
    },
    skip: !isDeal || skipQuery,
  })
  const { data: productsData, loading: productsQueryLoading } = useQuery(PRODUCTS_QUERY, {
    variables: {
      categoryId: categoryIdForQuery,
      name: search,
      brandId,
      specIds,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      page,
      limit: 12,
    },
    skip: isDeal || skipQuery,
  })
  const productsLoading = dealsLoading || productsQueryLoading

  const items = isDeal
    ? dealsData?.deals?.data || []
    : productsData?.products?.data || []
  const meta = isDeal ? dealsData?.deals?.meta : productsData?.products?.meta

  // --- Filter handlers ---

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

  const handleCategoryChange = (newCategoryId: number) => {
    const category = categories.find((cat: any) => cat.id === newCategoryId)
    if (category) {
      if (categoryKey) {
        const url = new URL(window.location.href)
        url.searchParams.delete('page')
        url.searchParams.delete('search')
        url.searchParams.delete('specs')
        url.searchParams.delete('brandId')
        url.searchParams.delete('minPrice')
        url.searchParams.delete('maxPrice')
      }
      router.push(`/products/${category.key.toLowerCase()}${isDeal ? '?type=deal' : ''}`)
    }
  }

  const handleBrandChange = (newBrandId?: number) => {
    const url = new URL(window.location.href)
    url.searchParams.delete('page')
    if (newBrandId) {
      url.searchParams.set('brandId', newBrandId.toString())
    } else {
      url.searchParams.delete('brandId')
    }
    router.push(url.pathname + url.search)
  }

  const handlePriceChange = (min?: number, max?: number) => {
    const url = new URL(window.location.href)
    url.searchParams.delete('page')
    if (min !== undefined) {
      url.searchParams.set('minPrice', min.toString())
    } else {
      url.searchParams.delete('minPrice')
    }
    if (max !== undefined) {
      url.searchParams.set('maxPrice', max.toString())
    } else {
      url.searchParams.delete('maxPrice')
    }
    router.push(url.pathname + url.search)
  }

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('sortBy', newSortBy)
    url.searchParams.set('sortOrder', newSortOrder)
    router.push(url.pathname + url.search)
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

  const handleClearAllFilters = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('search')
    url.searchParams.delete('specs')
    url.searchParams.delete('brandId')
    url.searchParams.delete('minPrice')
    url.searchParams.delete('maxPrice')
    url.searchParams.delete('categoryId')
    url.searchParams.delete('page')
    router.push(url.pathname + url.search)
  }

  // Build active filters
  const activeFilters = []
  if (search) {
    activeFilters.push({
      label: 'Search',
      value: search,
      onRemove: () => handleSearchChange(''),
    })
  }
  if (brandId) {
    const brand = brands.find((b: any) => b.id === brandId)
    if (brand) {
      activeFilters.push({
        label: 'Brand',
        value: brand.name,
        onRemove: () => handleBrandChange(undefined),
      })
    }
  }
  if (minPrice || maxPrice) {
    const priceRange = `${minPrice || '0'} - ${maxPrice || '∞'}`
    activeFilters.push({
      label: 'Price',
      value: priceRange,
      onRemove: () => handlePriceChange(undefined, undefined),
    })
  }
  if (specIds && specIds.length > 0) {
    activeFilters.push({
      label: 'Specs',
      value: `${specIds.length} selected`,
      onRemove: () => handleFilterChange([]),
    })
  }

  // Banner content varies by page type
  const bannerTitle = categoryKey
    ? isDeal ? 'Browse Used Deals' : 'Browse New Products'
    : isDeal ? 'All Used Deals' : 'All Products'

  const bannerDescription = categoryKey
    ? isDeal
      ? 'Find great deals on used audio, photography, and video equipment'
      : 'Discover the latest professional audio, photography, and video gear'
    : isDeal
      ? 'Browse all available deals on used equipment'
      : 'Browse our complete catalog of professional equipment'

  return (
    <main className="container mx-auto px-4 py-2">
      <PageBanner title={bannerTitle} description={bannerDescription}>
        <ToggleSwitch
          leftLabel="Used Deals"
          rightLabel="New Products"
          isLeftActive={isDeal}
          onClickLeft={handleToggleDeal}
          onClickRight={handleToggleNew}
        />
      </PageBanner>

      {/* Show message if parent category selected */}
      {hasSubcategories && !search && !specIds && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Showing products from <strong>{currentCategory?.name}</strong> category.
            Use the category filter to browse specific subcategories, or view all products without filters.
          </p>
        </div>
      )}

      {/* Mobile filter sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="w-3/4 sm:max-w-sm p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription className="sr-only">Filter products by category, brand, price, and more</SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-5rem)] px-6 pb-6">
            <FilterSidebar
              title=""
              specs={specTypes}
              selectedSpecIds={specIds || []}
              categories={categories}
              brands={brands}
              currentCategoryId={currentCategory?.id ?? categoryId}
              selectedBrandId={brandId}
              searchValue={search || ''}
              minPrice={minPrice}
              maxPrice={maxPrice}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onFilterChange={(ids) => { handleFilterChange(ids); setFiltersOpen(false) }}
              onSearchChange={(s) => { handleSearchChange(s); setFiltersOpen(false) }}
              onCategoryChange={(id) => { handleCategoryChange(id); setFiltersOpen(false) }}
              onBrandChange={(id) => { handleBrandChange(id); setFiltersOpen(false) }}
              onPriceChange={(min, max) => { handlePriceChange(min, max); setFiltersOpen(false) }}
              onSortChange={(by, order) => { handleSortChange(by, order); setFiltersOpen(false) }}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 lg:gap-x-12 mt-6">
        <aside className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            title="Filters"
            specs={specTypes}
            selectedSpecIds={specIds || []}
            categories={categories}
            brands={brands}
            currentCategoryId={currentCategory?.id ?? categoryId}
            selectedBrandId={brandId}
            searchValue={search || ''}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onBrandChange={handleBrandChange}
            onPriceChange={handlePriceChange}
            onSortChange={handleSortChange}
          />
        </aside>

        <div className="mt-8 lg:col-span-2 xl:col-span-3 2xl:col-span-4 lg:mt-0">
          {/* Mobile filter trigger */}
          <Button
            variant="outline"
            className="lg:hidden mb-4"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilters.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs">
                {activeFilters.length}
              </span>
            )}
          </Button>
          {!productsLoading && meta && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {meta.total} {meta.total === 1 ? 'result' : 'results'}
                {search && <> for &quot;<strong>{search}</strong>&quot;</>}
              </p>
              <ActiveFilters filters={activeFilters} onClearAll={handleClearAllFilters} />
            </div>
          )}

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
                {hasSubcategories
                  ? 'Try selecting a specific subcategory from the filters'
                  : 'Try adjusting your filters or search query'}
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
