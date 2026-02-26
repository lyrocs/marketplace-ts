'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react'
import { DISCUSSION_QUERY, MARK_DISCUSSION_READ_MUTATION, MESSAGES_QUERY } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useChat } from '@/hooks/use-chat'
import { ChatHeader, ChatRoom, MessageInput } from '@/components/chat'
import { Skeleton } from '@marketplace/ui'

export default function ChatRoomPage() {
  const params = useParams()
  const discussionId = parseInt(params.id as string)
  const { user, loading: authLoading } = useAuthGuard()

  const { data, loading } = useQuery(DISCUSSION_QUERY, {
    variables: { id: discussionId },
    skip: !user,
  })

  const [markRead] = useMutation(MARK_DISCUSSION_READ_MUTATION)
  const [fetchMessages, { data: messagesData }] = useLazyQuery(MESSAGES_QUERY, {
    fetchPolicy: 'network-only',
  })

  const discussion = data?.discussion

  const {
    messages: realtimeMessages,
    connectionStatus,
    sendMessage,
    loadMessages,
    markRead: socketMarkRead,
    joinDiscussion,
  } = useChat()

  // Load history and join discussion room
  useEffect(() => {
    if (!discussion) return
    loadMessages(discussionId)
    joinDiscussion(discussionId)
    fetchMessages({ variables: { discussionId } })
    markRead({ variables: { discussionId } }).catch(() => {})
    socketMarkRead(discussionId)
  }, [discussion, discussionId, loadMessages, joinDiscussion, fetchMessages, markRead, socketMarkRead])

  // Merge history messages with realtime messages
  const historyMessages = messagesData?.messages?.messages || []
  const allMessages = [...historyMessages]
  for (const msg of realtimeMessages) {
    if (!allMessages.some((m: any) => m.id === msg.id)) {
      allMessages.push(msg)
    }
  }
  allMessages.sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const handleSend = (text: string) => {
    sendMessage(discussionId, text)
  }

  if (authLoading) return null

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Skeleton className="h-20 w-full" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading discussion...</p>
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Discussion not found</p>
      </div>
    )
  }

  const isConnected = connectionStatus === 'connected'

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <ChatHeader
        discussion={discussion}
        connectionStatus={connectionStatus}
        currentUserId={user?.id || ''}
      />

      <ChatRoom
        messages={allMessages.map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt,
        }))}
        currentUserId={user?.id || ''}
        otherUserName={
          (discussion.buyer.id === user?.id ? discussion.seller : discussion.buyer).name
        }
        otherUserImage={
          (discussion.buyer.id === user?.id ? discussion.seller : discussion.buyer).image
        }
        isLoading={!messagesData && realtimeMessages.length === 0}
      />

      <MessageInput
        onSend={handleSend}
        disabled={!isConnected}
        placeholder={
          isConnected ? 'Type a message...' : 'Connecting to chat...'
        }
      />
    </div>
  )
}
