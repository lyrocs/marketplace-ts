'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../hooks/use-auth'
import { Badge, Avatar, AvatarFallback, AvatarImage } from '@nextrade/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@nextrade/ui'
import { MessageSquare, ChevronDown } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { ROOT_CATEGORIES_QUERY } from '../../graphql/queries'
import { useState } from 'react'

export function Header() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth()
  const { data: categoriesData } = useQuery(ROOT_CATEGORIES_QUERY)
  const rootCategories = categoriesData?.rootCategories || []
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">NexTrade</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>

            {/* Categories Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Categories
                <ChevronDown className="h-3 w-3" />
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 top-full pt-2 w-[600px]">
                  <div className="rounded-lg border bg-popover p-6 shadow-lg"
                >
                  <div className="grid grid-cols-2 gap-6">
                    {rootCategories.map((category: any) => (
                      <div key={category.id} className="space-y-3">
                        <Link
                          href={`/products/${category.key.toLowerCase()}`}
                          className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          {category.image && (
                            <div className="relative h-6 w-6 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover"
                                sizes="24px"
                              />
                            </div>
                          )}
                          <span>{category.name}</span>
                        </Link>

                        {category.children && category.children.length > 0 && (
                          <div className="space-y-2 pl-8">
                            {category.children.map((child: any) => (
                              <Link
                                key={child.id}
                                href={`/products/${child.key.toLowerCase()}`}
                                className="group block"
                                onClick={() => setCategoriesOpen(false)}
                              >
                                <div className="flex items-start gap-2">
                                  {child.image && (
                                    <div className="relative h-5 w-5 rounded overflow-hidden flex-shrink-0 mt-0.5">
                                      <Image
                                        src={child.image}
                                        alt={child.name}
                                        fill
                                        className="object-cover"
                                        sizes="20px"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                      {child.name}
                                    </p>
                                    {child.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                        {child.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                    <div className="mt-6 pt-4 border-t">
                      <Link
                        href="/products"
                        className="text-sm font-medium text-primary hover:underline"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/products?type=deal" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Deals
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/chat" className="relative p-2 text-muted-foreground hover:text-foreground">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    {user?.image && <AvatarImage src={user.image} />}
                    <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name || user?.email}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    {isAdmin && <Badge variant="secondary" className="mt-1">Admin</Badge>}
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profile" className="block">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <Link href="/deals" className="block">
                    <DropdownMenuItem>My Deals</DropdownMenuItem>
                  </Link>
                  <Link href="/deals/create" className="block">
                    <DropdownMenuItem>Sell Item</DropdownMenuItem>
                  </Link>
                  <Link href="/chat" className="block">
                    <DropdownMenuItem>Messages</DropdownMenuItem>
                  </Link>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <Link href="/admin" className="block">
                        <DropdownMenuItem>Admin Panel</DropdownMenuItem>
                      </Link>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign In
              </Link>
              <Link href="/register" className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
