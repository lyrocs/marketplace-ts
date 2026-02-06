'use client'

import Link from 'next/link'
import { useAuth } from '../../hooks/use-auth'
import { Badge, Avatar, AvatarFallback, AvatarImage } from '@nextrade/ui'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@nextrade/ui'
import { MessageSquare } from 'lucide-react'

export function Header() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth()

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
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Products
            </Link>
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
