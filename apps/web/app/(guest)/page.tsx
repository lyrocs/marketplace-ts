import { RECENT_DEALS_QUERY } from '@/graphql/queries'
import { fetchGraphQLCached } from '@/lib/graphql-server'
import { HeroSection } from '@/components/shared/hero-section'
import { FeatureCard } from '@/components/cards/feature-card'
import { FeatureIcon } from '@/components/shared/feature-icon'
import { CTASection } from '@/components/shared/cta-section'
import { DealCard } from '@/components/cards/deal-card'
import { Users, Store, ShieldCheck, BookOpen, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

// SEO Metadata
export const metadata: Metadata = {
  title: 'Marketplace — FPV Drone Gear',
  description: 'The marketplace built for FPV pilots. Browse frames, motors, ESCs, goggles, radios, and more. Compare prices and trade with the community.',
  keywords: ['fpv drone', 'fpv marketplace', 'drone gear', 'fpv motors', 'fpv frames', 'fpv goggles', 'drone deals'],
  openGraph: {
    title: 'Marketplace — FPV Drone Gear',
    description: 'The marketplace built for FPV pilots. Browse gear, compare prices, and trade with the community.',
    type: 'website',
  },
}

// Server Component - no 'use client'
export default async function HomePage() {
  // Fetch data server-side
  const dealsData = await fetchGraphQLCached(RECENT_DEALS_QUERY, undefined, 60)
  const recentDeals = dealsData?.recentDeals || []

  return (
    <div>
      {/* Hero Section with Search */}
      <HeroSection />

      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Explore Cards Section */}
        <section className="grid grid-cols-1 gap-6 text-center md:grid-cols-2 lg:gap-8">
          <FeatureCard
            href="/products?type=deal"
            icon={<Users className="h-12 w-12" />}
            title="Explore Deals"
            description="Browse FPV gear deals from verified pilots in our community marketplace."
            linkText="Browse All Deals"
          />
          <FeatureCard
            href="/products"
            icon={<Store className="h-12 w-12" />}
            title="Explore Products"
            description="Discover our catalog of FPV components with detailed specs and price comparisons."
            linkText="View Product Catalog"
          />
        </section>

        {/* Recent Deals Section */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold font-heading">Latest Deals</h2>
              <p className="text-muted-foreground mt-1">Fresh listings from the FPV community</p>
            </div>
            <Link href="/products?type=deal" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
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
        <section className="mt-20 rounded-xl glass-card p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-foreground font-heading">Built for FPV Pilots</h2>
            <p className="mt-2 text-muted-foreground">Trade with confidence on a platform designed for the FPV community</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <FeatureIcon
              icon={<ShieldCheck className="h-12 w-12" />}
              title="Verified Pilots"
              description="All sellers are verified to ensure safe and trustworthy transactions."
            />
            <FeatureIcon
              icon={<BookOpen className="h-12 w-12" />}
              title="Gear Database"
              description="Extensive database of FPV components with detailed specifications."
            />
            <FeatureIcon
              icon={<MessageCircle className="h-12 w-12" />}
              title="Direct Chat"
              description="Built-in messaging to communicate directly with buyers and sellers."
            />
          </div>
        </section>

        {/* CTA Section */}
        <CTASection
          title="Start Selling Your Gear"
          description="Join the FPV community marketplace. List your used gear and find it a new home!"
          buttonText="Create a Deal"
          buttonHref="/deals/create"
        />
      </div>

      {/* Stats Banner */}
      <section className="border-t border-border/50 bg-card/30">
        <div className="container py-12">
          <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
            <div>
              <p className="text-3xl font-bold text-primary font-mono">10K+</p>
              <p className="text-sm text-muted-foreground mt-1">Active Listings</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary font-mono">5K+</p>
              <p className="text-sm text-muted-foreground mt-1">FPV Pilots</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary font-mono">25K+</p>
              <p className="text-sm text-muted-foreground mt-1">Completed Trades</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
