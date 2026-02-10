import { RECENT_DEALS_QUERY, ROOT_CATEGORIES_QUERY } from '@/graphql/queries'
import { fetchGraphQLCached } from '@/lib/graphql-server'
import { HeroSection } from '@/components/shared/hero-section'
import { FeatureCard } from '@/components/cards/feature-card'
import { FeatureIcon } from '@/components/shared/feature-icon'
import { CTASection } from '@/components/shared/cta-section'
import { DealCard } from '@/components/cards/deal-card'
import { Users, Store, ShieldCheck, BookOpen, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'

// SEO Metadata
export const metadata: Metadata = {
  title: 'Marketplace - Buy & Sell Tech Products',
  description: 'Your trusted marketplace for buying and selling quality tech products. Browse thousands of deals from verified sellers.',
  keywords: ['tech marketplace', 'buy tech', 'sell electronics', 'gadgets', 'deals'],
  openGraph: {
    title: 'Marketplace - Buy & Sell Tech Products',
    description: 'Your trusted marketplace for buying and selling quality tech products.',
    type: 'website',
  },
}

// Server Component - no 'use client'
export default async function HomePage() {
  // Fetch data server-side in parallel
  const [dealsData, categoriesData] = await Promise.all([
    fetchGraphQLCached(RECENT_DEALS_QUERY, undefined, 60), // Cache for 60 seconds
    fetchGraphQLCached(ROOT_CATEGORIES_QUERY, undefined, 300), // Cache for 5 minutes
  ])

  const recentDeals = dealsData?.recentDeals || []
  const categories = categoriesData?.rootCategories || []

  // Check authentication server-side (via cookie)
  const cookieStore = await cookies()
  const token = cookieStore.get('marketplace_token')
  const isAuthenticated = !!token

  return (
    <div>
      {/* Hero Section with Search */}
      <HeroSection
        title="Buy & Sell Tech Products"
        description="Your trusted marketplace for buying and selling quality tech products."
        backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80"
        isAuthenticated={isAuthenticated}
      />

      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Explore Cards Section */}
        <section className="grid grid-cols-1 gap-6 text-center md:grid-cols-2 lg:gap-8">
          <FeatureCard
            href="/deals"
            icon={<Users className="h-12 w-12" />}
            title="Explore Deals"
            description="Browse thousands of tech deals from verified sellers in our community marketplace."
            linkText="Browse All Deals"
          />
          <FeatureCard
            href="/products"
            icon={<Store className="h-12 w-12" />}
            title="Explore Products"
            description="Discover our extensive catalog of tech products with detailed specifications and reviews."
            linkText="View Product Catalog"
          />
        </section>

        {/* Categories Section */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Browse Categories</h2>
              <p className="text-muted-foreground mt-1">Find products in your favorite category</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products/${cat.key}`}
                className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 bg-white p-6 text-center transition-all hover:border-primary hover:shadow-lg"
              >
                {cat.image ? (
                  <div className="h-12 w-12 flex items-center justify-center text-4xl">
                    <img src={cat.image} alt={cat.name} className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <span className="text-4xl">📂</span>
                )}
                <span className="text-sm font-semibold group-hover:text-primary transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Deals Section */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Latest Deals</h2>
              <p className="text-muted-foreground mt-1">Fresh listings from our community</p>
            </div>
            <Link href="/deals" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View all <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {recentDeals.slice(0, 8).map((deal: any) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </section>

        {/* Trust & Security Section */}
        <section className="mt-20 rounded-xl bg-white p-8 shadow-lg md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-gray-800">Why Choose Us?</h2>
            <p className="mt-2 text-gray-600">Trade with confidence on a platform built for tech enthusiasts</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <FeatureIcon
              icon={<ShieldCheck className="h-12 w-12" />}
              title="Verified Users"
              description="All sellers are verified to ensure safe and trustworthy transactions."
            />
            <FeatureIcon
              icon={<BookOpen className="h-12 w-12" />}
              title="Product Catalog"
              description="Extensive database of tech products with detailed specifications."
            />
            <FeatureIcon
              icon={<MessageCircle className="h-12 w-12" />}
              title="Direct Contact"
              description="Built-in messaging to communicate directly with buyers and sellers."
            />
          </div>
        </section>

        {/* CTA Section */}
        <CTASection
          title="Start Selling Today"
          description="Join thousands of sellers and turn your unused tech into cash. Create your first listing in minutes!"
          buttonText="Create a Deal"
          buttonHref="/deals/create"
        />
      </div>

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
