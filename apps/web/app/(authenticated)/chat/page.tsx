'use client'

import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { MY_DISCUSSIONS_QUERY } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, Avatar, AvatarFallback, AvatarImage, Badge, Skeleton } from '@nextrade/ui'
import { MessageSquare } from 'lucide-react'

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuthGuard()
  const { data, loading } = useQuery(MY_DISCUSSIONS_QUERY, { skip: !user })

  if (authLoading) return null

  const discussions = data?.myDiscussions || []

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : discussions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground mt-4">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Contact a seller on a deal to start a conversation
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {discussions.map((discussion: any) => {
              const otherUser = discussion.buyer.id === user?.id ? discussion.seller : discussion.buyer
              return (
                <Link key={discussion.id} href={`/chat/${discussion.id}`} className="block">
                  <Card className={`hover:shadow-md transition-shadow ${discussion.hasUnread ? 'border-primary' : ''}`}>
                    <CardContent className="flex items-center gap-4 py-3">
                      <Avatar>
                        {otherUser.image && <AvatarImage src={otherUser.image} />}
                        <AvatarFallback>{otherUser.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{otherUser.name || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          Deal: {discussion.deal?.title || `#${discussion.deal?.id}`}
                        </p>
                      </div>
                      {discussion.hasUnread && (
                        <Badge variant="default" className="rounded-full">New</Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
