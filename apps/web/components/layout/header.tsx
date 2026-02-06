'use client'

import Link from 'next/link'
import { useAuth } from '../../hooks/use-auth'
import { Badge, Avatar, AvatarFallback, AvatarImage } from '@nextrade/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@nextrade/ui'
import { MessageSquare, ChevronDown } from 'lucide-react'
import { useQuery } from '@apollo/client/react'
import { ROOT_CATEGORIES_QUERY } from '../../graphql/queries'

export function Header() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth()
  const { data: categoriesData } = useQuery(ROOT_CATEGORIES_QUERY)
  const rootCategories = categoriesData?.rootCategories || []

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

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Categories
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Browse by Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {rootCategories.map((category: any) => (
                  category.children && category.children.length > 0 ? (
                    <DropdownMenuSub key={category.id}>
                      <DropdownMenuSubTrigger>{category.name}</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <Link href={`/products/${category.key.toLowerCase()}`}>
                            <DropdownMenuItem>All {category.name}</DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          {category.children.map((child: any) => (
                            <Link key={child.id} href={`/products/${child.key.toLowerCase()}`}>
                              <DropdownMenuItem>{child.name}</DropdownMenuItem>
                            </Link>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  ) : (
                    <Link key={category.id} href={`/products/${category.key.toLowerCase()}`}>
                      <DropdownMenuItem>{category.name}</DropdownMenuItem>
                    </Link>
                  )
                ))}
                <DropdownMenuSeparator />
                <Link href="/products">
                  <DropdownMenuItem className="font-medium">View All Products</DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/deals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
