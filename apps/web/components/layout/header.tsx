'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../hooks/use-auth'
import { Badge, Avatar, AvatarFallback, AvatarImage } from '@marketplace/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@marketplace/ui'
import { MessageSquare, ChevronDown, Menu, X, User, ShoppingBag, PlusCircle, Shield, LogOut, LogIn, UserPlus } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { ROOT_CATEGORIES_QUERY, UNREAD_COUNT_QUERY } from '../../graphql/queries'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function Header() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth()
  const { data: categoriesData } = useQuery(ROOT_CATEGORIES_QUERY)
  const rootCategories = categoriesData?.rootCategories || []
  const { data: unreadData } = useQuery(UNREAD_COUNT_QUERY, {
    skip: !isAuthenticated,
    pollInterval: 15000,
  })
  const unreadCount = unreadData?.unreadCount?.count || 0
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false)
    setMobileCategoriesOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [mobileOpen])

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-[0_1px_0_0_hsl(var(--neon-cyan)/0.1)]">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gradient font-heading">Marketplace</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Categories
                <ChevronDown className="h-3 w-3" />
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 top-full pt-2 w-[750px]">
                  <div className="rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-lg p-4">
                    <div className="grid grid-cols-3 gap-3">
                      {rootCategories.map((category: any) => (
                        <div key={category.id} className="space-y-1.5">
                          <Link
                            href={`/products/${category.key.toLowerCase()}`}
                            className="flex items-center gap-3 font-semibold text-sm hover:text-primary transition-colors group"
                            onClick={() => setCategoriesOpen(false)}
                          >
                            {category.image && (
                              <div className="relative h-8 w-8 rounded-lg overflow-hidden flex-shrink-0">
                                <Image src={category.image} alt={category.name} fill className="object-cover" sizes="32px" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="group-hover:text-primary transition-colors">{category.name}</span>
                              {category.description && (
                                <p className="text-xs font-normal text-muted-foreground line-clamp-1 mt-0.5">{category.description}</p>
                              )}
                            </div>
                          </Link>

                          {category.children?.length > 0 && (
                            <div className="space-y-0.5 pl-8">
                              {category.children.map((child: any) => (
                                <Link
                                  key={child.id}
                                  href={`/products/${child.key.toLowerCase()}`}
                                  className="group block hover:bg-white/5 rounded-lg p-1.5 -ml-1.5 transition-colors"
                                  onClick={() => setCategoriesOpen(false)}
                                >
                                  <div className="flex items-start gap-2">
                                    {child.image && (
                                      <div className="relative h-5 w-5 rounded overflow-hidden flex-shrink-0 mt-0.5">
                                        <Image src={child.image} alt={child.name} fill className="object-cover" sizes="20px" />
                                      </div>
                                    )}
                                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{child.name}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50">
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
          </nav>
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/chat" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
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
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="inline-flex items-center rounded-md bg-gradient-to-r from-[hsl(185,100%,50%)] to-[hsl(270,95%,65%)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

    </header>

      {/* Mobile menu — rendered outside header to escape backdrop-blur containing block */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background/98 backdrop-blur-xl overflow-y-auto">
          <div className="container py-4 space-y-1">
            {/* User info */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2">
                <Avatar className="h-10 w-10">
                  {user.image && <AvatarImage src={user.image} />}
                  <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || user.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {isAdmin && <Badge variant="secondary">Admin</Badge>}
              </div>
            )}

            {/* Categories accordion */}
            <button
              className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
            >
              <span>Categories</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileCategoriesOpen && (
              <div className="pl-4 space-y-1">
                {rootCategories.map((category: any) => (
                  <div key={category.id}>
                    <Link
                      href={`/products/${category.key.toLowerCase()}`}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {category.image && (
                        <div className="relative h-6 w-6 rounded overflow-hidden flex-shrink-0">
                          <Image src={category.image} alt={category.name} fill className="object-cover" sizes="24px" />
                        </div>
                      )}
                      {category.name}
                    </Link>
                    {category.children?.length > 0 && (
                      <div className="pl-6 space-y-0.5">
                        {category.children.map((child: any) => (
                          <Link
                            key={child.id}
                            href={`/products/${child.key.toLowerCase()}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground rounded-lg hover:bg-white/5 hover:text-foreground transition-colors"
                          >
                            {child.image && (
                              <div className="relative h-5 w-5 rounded overflow-hidden flex-shrink-0">
                                <Image src={child.image} alt={child.name} fill className="object-cover" sizes="20px" />
                              </div>
                            )}
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Link
                  href="/products"
                  className="block px-3 py-2 text-sm font-medium text-primary hover:underline"
                >
                  View All Products →
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <>
                <div className="border-t border-border/50 my-2" />
                <Link href="/chat" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" /> Messages
                  {unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">
                  <User className="h-4 w-4 text-muted-foreground" /> Profile
                </Link>
                <Link href="/deals" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" /> My Deals
                </Link>
                <Link href="/deals/create" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">
                  <PlusCircle className="h-4 w-4 text-muted-foreground" /> Sell Item
                </Link>
                {isAdmin && (
                  <>
                    <div className="border-t border-border/50 my-2" />
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">
                      <Shield className="h-4 w-4 text-muted-foreground" /> Admin Panel
                    </Link>
                  </>
                )}
                <div className="border-t border-border/50 my-2" />
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="border-t border-border/50 my-2" />
                <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">
                  <LogIn className="h-4 w-4 text-muted-foreground" /> Sign In
                </Link>
                <Link href="/register" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors">
                  <UserPlus className="h-4 w-4 text-muted-foreground" /> Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
