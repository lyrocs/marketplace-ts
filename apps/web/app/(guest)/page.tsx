'use client'

import { useQuery } from '@apollo/client'
import { RECENT_DEALS_QUERY, ROOT_CATEGORIES_QUERY } from '@/graphql/queries'
import { HeroSection } from '@/components/shared/hero-section'
import { DealCard } from '@/components/cards/deal-card'
import { Skeleton } from '@nextrade/ui'
import Link from 'next/link'

export default function HomePage() {
  const { data: dealsData, loading: dealsLoading } = useQuery(RECENT_DEALS_QUERY)
  const { data: categoriesData, loading: categoriesLoading } = useQuery(ROOT_CATEGORIES_QUERY)

  const recentDeals = dealsData?.recentDeals || []
  const categories = categoriesData?.rootCategories || []

  return (
    <div>
      <HeroSection />

      {/* Categories Section */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Browse Categories</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categoriesLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-lg" />
              ))
            : categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/products/${cat.key}`}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border bg-card p-4 text-center transition-shadow hover:shadow-md"
                >
                  <span className="text-2xl">{cat.image || '📂'}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </Link>
              ))}
        </div>
      </section>

      {/* Recent Deals Section */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Deals</h2>
          <Link href="/deals" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dealsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))
            : recentDeals.map((deal: any) => <DealCard key={deal.id} deal={deal} />)}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-muted/50">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
            <div>
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Active Listings</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">5K+</p>
              <p className="text-sm text-muted-foreground mt-1">Happy Sellers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">25K+</p>
              <p className="text-sm text-muted-foreground mt-1">Completed Trades</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
