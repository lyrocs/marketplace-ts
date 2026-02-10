import Link from 'next/link'
import { Button } from '@marketplace/ui'
import { HeroSearch } from './hero-search'

interface HeroSectionProps {
  title?: string
  description?: string
  backgroundImage?: string
  searchPlaceholder?: string
  isAuthenticated?: boolean
}

export function HeroSection({
  title = 'Buy & Sell Tech Products',
  description = 'Your trusted marketplace for buying and selling quality tech products.',
  backgroundImage = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80',
  searchPlaceholder,
  isAuthenticated = false,
}: HeroSectionProps) {
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/60" />

      {/* Decorative Blurs (fallback if no image) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">{title}</h1>
        <p className="mt-4 text-lg text-white/90 md:text-xl">{description}</p>

        {/* Search Bar - Client Component */}
        <HeroSearch placeholder={searchPlaceholder} />

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link href="/deals">
            <Button size="lg" variant="outline" className="border-white/50 bg-white/10 text-white hover:bg-white/20">
              Browse Deals
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link href="/deals/create">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Sell an Item
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
