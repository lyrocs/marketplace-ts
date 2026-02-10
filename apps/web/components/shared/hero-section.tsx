'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Input } from '@marketplace/ui'
import { Search } from 'lucide-react'
import { useAuth } from '../../hooks/use-auth'

interface HeroSectionProps {
  title?: string
  description?: string
  backgroundImage?: string
  searchPlaceholder?: string
}

export function HeroSection({
  title = 'Buy & Sell Tech Products',
  description = 'Your trusted marketplace for buying and selling quality tech products.',
  backgroundImage = '/images/home-banner.jpg',
  searchPlaceholder = 'Search for products, deals, or brands...',
}: HeroSectionProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

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
        <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-white/90 md:text-xl">{description}</p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl items-center justify-center">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-4 text-base shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </form>

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
