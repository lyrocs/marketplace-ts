'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import Link from 'next/link'
import { DISCUSSION_QUERY, MARK_DISCUSSION_READ_MUTATION } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useMatrix } from '@/hooks/use-matrix'
import { Input, Button, Avatar, AvatarFallback, AvatarImage, Skeleton } from '@nextrade/ui'
import { ArrowLeft, Send } from 'lucide-react'

export default function ChatRoomPage() {
  const params = useParams()
  const discussionId = parseInt(params.id as string)
  const { user, loading: authLoading } = useAuthGuard()
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data, loading } = useQuery(DISCUSSION_QUERY, {
    variables: { id: discussionId },
    skip: !user,
  })

  const [markRead] = useMutation(MARK_DISCUSSION_READ_MUTATION)

  const discussion = data?.discussion
  const matrixRoomId = discussion?.matrixRoomId

  // Initialize Matrix client and load messages
  const { messages, loading: matrixLoading, error: matrixError, sendMessage, loadMessages } = useMatrix()

  useEffect(() => {
    if (matrixRoomId) {
      loadMessages(matrixRoomId)
      markRead({ variables: { discussionId } }).catch(() => {})
    }
  }, [matrixRoomId, discussionId, loadMessages, markRead])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim() || !matrixRoomId) return
    const text = inputText.trim()
    setInputText('')

    try {
      await sendMessage(matrixRoomId, text)
    } catch (err) {
      console.error('Failed to send message:', err)
      // Optionally show error toast
    }
  }

  if (authLoading) return null

  if (loading || matrixLoading) {
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

  if (matrixError) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Matrix error: {matrixError}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Make sure Matrix credentials are configured properly.
          </p>
        </div>
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
          const isOwn = msg.sender === user?.matrixLogin
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

      {/* Matrix Room ID for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Matrix Room: {discussion.matrixRoomId}
        </p>
      )}
    </div>
  )
}
