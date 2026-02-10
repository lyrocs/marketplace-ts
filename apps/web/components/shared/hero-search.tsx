'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@marketplace/ui'
import { Search } from 'lucide-react'

interface HeroSearchProps {
  placeholder?: string
}

export function HeroSearch({ placeholder = 'Search for products, deals, or brands...' }: HeroSearchProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl items-center justify-center">
      <div className="relative w-full max-w-md">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 pl-12 pr-4 text-base shadow-lg"
        />
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </form>
  )
}
