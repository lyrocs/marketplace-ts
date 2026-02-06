'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { DISCUSSION_QUERY, MARK_DISCUSSION_READ_MUTATION } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { Input, Button, Avatar, AvatarFallback, AvatarImage, Skeleton } from '@nextrade/ui'
import { Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface MatrixMessage {
  eventId: string
  sender: string
  body: string
  timestamp: number
}

export default function ChatRoomPage() {
  const params = useParams()
  const discussionId = parseInt(params.id as string)
  const { user, loading: authLoading } = useAuthGuard()

  const { data, loading } = useQuery(DISCUSSION_QUERY, {
    variables: { id: discussionId },
    skip: !user,
  })

  const [markRead] = useMutation(MARK_DISCUSSION_READ_MUTATION)
  const [messages, setMessages] = useState<MatrixMessage[]>([])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const discussion = data?.discussion

  // Mark as read when viewing
  useEffect(() => {
    if (discussionId && user) {
      markRead({ variables: { discussionId } })
    }
  }, [discussionId, user, markRead])

  // Matrix real-time messaging is handled server-side via the Matrix module.
  // New messages trigger discussion_status updates which are polled via GraphQL.

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim() || !discussion) return
    const text = inputText.trim()
    setInputText('')

    // In production, this would send via Matrix SDK
    // Placeholder: add message to local state
    setMessages((prev) => [
      ...prev,
      {
        eventId: Date.now().toString(),
        sender: user?.id || '',
        body: text,
        timestamp: Date.now(),
      },
    ])
  }

  if (authLoading) return null

  if (loading) {
    return (
      <div className="container max-w-2xl py-8">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="mt-4 h-64 rounded-lg" />
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="container max-w-2xl py-8">
        <p className="text-muted-foreground">Discussion not found</p>
      </div>
    )
  }

  const otherUser = discussion.buyer.id === user?.id ? discussion.seller : discussion.buyer

  return (
    <div className="container max-w-2xl py-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <Link href="/chat" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar>
          {otherUser.image && <AvatarImage src={otherUser.image} />}
          <AvatarFallback>{otherUser.name?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{otherUser.name || 'Anonymous'}</p>
          <p className="text-xs text-muted-foreground">Deal: {discussion.deal?.title || `#${discussion.deal?.id}`}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="mt-4 flex flex-col gap-3 min-h-[300px] max-h-[500px] overflow-y-auto pb-2">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Start a conversation with {otherUser.name || 'the other party'}
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender === user?.id
          return (
            <div key={msg.eventId} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.body}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex items-center gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!inputText.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Matrix Room ID for debugging/integration */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Matrix Room: {discussion.matrixRoomId}
      </p>
    </div>
  )
}
