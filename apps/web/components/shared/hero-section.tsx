import Link from 'next/link'
import { Button } from '@marketplace/ui'
import { useAuth } from '../../hooks/use-auth'

export function HeroSection() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="relative flex min-h-[50vh] flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/80 to-secondary px-4 text-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-4xl font-bold text-white md:text-6xl">
          Buy & Sell
          <span className="block mt-2 text-primary-foreground/90">Tech Products</span>
        </h1>
        <p className="mt-6 text-lg text-white/90 md:text-xl">
          Your trusted marketplace for buying and selling quality tech products.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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
