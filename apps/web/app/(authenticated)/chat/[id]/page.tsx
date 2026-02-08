'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { DISCUSSION_QUERY, MARK_DISCUSSION_READ_MUTATION } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useMatrix } from '@/hooks/use-matrix'
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

  const discussion = data?.discussion
  const matrixRoomId = discussion?.matrixRoomId

  // Initialize Matrix client and load messages
  const {
    messages,
    loading: matrixLoading,
    error: matrixError,
    connectionStatus,
    sendMessage,
    loadMessages,
  } = useMatrix()

  useEffect(() => {
    if (matrixRoomId) {
      loadMessages(matrixRoomId)
      markRead({ variables: { discussionId } }).catch(() => {})
    }
  }, [matrixRoomId, discussionId, loadMessages, markRead])

  const handleSend = async (text: string) => {
    if (!matrixRoomId) return

    try {
      await sendMessage(matrixRoomId, text)
    } catch (err) {
      console.error('Failed to send message:', err)
    }
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

  if (matrixError) {
    return (
      <div className="flex flex-col h-screen">
        <ChatHeader
          discussion={discussion}
          connectionStatus="error"
          currentUserId={user?.id || ''}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 max-w-md">
            <p className="text-sm text-destructive">Matrix error: {matrixError}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure Matrix credentials are configured properly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const otherUser =
    discussion.buyer.id === user?.id ? discussion.seller : discussion.buyer

  const isConnected = connectionStatus === 'connected'

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <ChatHeader
        discussion={discussion}
        connectionStatus={connectionStatus}
        currentUserId={user?.id || ''}
      />

      <ChatRoom
        messages={messages}
        currentUserMatrixLogin={user?.matrixLogin || ''}
        otherUserName={otherUser.name}
        otherUserImage={otherUser.image}
        isLoading={matrixLoading}
      />

      <MessageInput
        onSend={handleSend}
        disabled={!isConnected}
        placeholder={
          isConnected
            ? 'Type a message...'
            : 'Connecting to chat...'
        }
      />

      {/* Matrix Room ID for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t p-2 text-center">
          <p className="text-xs text-muted-foreground">
            Room: {discussion.matrixRoomId}
          </p>
        </div>
      )}
    </div>
  )
}
