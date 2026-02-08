'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { MY_DISCUSSIONS_QUERY } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { DiscussionList } from '@/components/chat'
import { Card, CardContent, Skeleton } from '@marketplace/ui'
import { MessageSquare } from 'lucide-react'

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuthGuard()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, loading } = useQuery(MY_DISCUSSIONS_QUERY, {
    skip: !user,
    pollInterval: 10000, // Poll every 10 seconds for new messages
  })

  if (authLoading) return null

  const discussions = data?.myDiscussions || []

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <Card className="max-w-md w-full">
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground mt-4">
                  No messages yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Contact a seller on a deal to start a conversation
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <DiscussionList
            discussions={discussions}
            selectedId={null}
            currentUserId={user?.id || ''}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />
        )}
      </div>
    </div>
  )
}
