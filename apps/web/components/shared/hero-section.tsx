'use client'

import Link from 'next/link'
import { Button } from '@marketplace/ui'
import { HeroSearch } from './hero-search'
import { useAuth } from '../../hooks/use-auth'

interface HeroSectionProps {
  title?: string
  description?: string
  backgroundImage?: string
  searchPlaceholder?: string
}

export function HeroSection({
  title = 'Find Your Next FPV Setup',
  description = 'The marketplace built for FPV pilots. Browse gear, compare prices, and trade with the community.',
  searchPlaceholder,
}: HeroSectionProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
      {/* Dark base + grid pattern */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-grid opacity-[0.05]" />

      {/* Floating gradient orbs */}
      <div className="absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-[hsl(185,100%,50%)] opacity-15 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-[hsl(270,95%,65%)] opacity-15 blur-[120px] animate-float [animation-delay:3s]" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        <h1 className="font-heading text-5xl font-extrabold tracking-tight md:text-7xl">
          Find Your Next <span className="text-gradient">FPV Setup</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">{description}</p>

        {/* Search Bar */}
        <HeroSearch placeholder={searchPlaceholder} />

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/products?type=deal">
            <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50">
              Browse Deals
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link href="/deals/create">
              <Button size="lg" className="bg-gradient-to-r from-[hsl(185,100%,50%)] to-[hsl(270,95%,65%)] text-white hover:opacity-90 border-0">
                Create a Deal
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-[hsl(185,100%,50%)] to-[hsl(270,95%,65%)] text-white hover:opacity-90 border-0">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
