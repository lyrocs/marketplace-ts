'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './use-auth'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface ChatMessage {
  id: string
  discussionId: number
  senderId: string
  content: string
  createdAt: string
}

interface ChatContextType {
  connectionStatus: ConnectionStatus
  messages: ChatMessage[]
  sendMessage: (discussionId: number, content: string) => void
  loadMessages: (discussionId: number) => void
  markRead: (discussionId: number) => void
  joinDiscussion: (discussionId: number) => void
  onUnreadUpdate: (callback: (data: { discussionId: number }) => void) => () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const currentDiscussionId = useRef<number | null>(null)
  const unreadCallbacks = useRef<Set<(data: { discussionId: number }) => void>>(new Set())

  useEffect(() => {
    if (!user) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('marketplace_token') : null
    if (!token) return

    setConnectionStatus('connecting')

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const baseUrl = apiUrl.replace('/graphql', '').replace(/\/$/, '')

    const s = io(`${baseUrl}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    s.on('connect', () => {
      setConnectionStatus('connected')
    })

    s.on('disconnect', () => {
      setConnectionStatus('disconnected')
    })

    s.on('connect_error', () => {
      setConnectionStatus('error')
    })

    s.on('new_message', (msg: ChatMessage) => {
      if (msg.discussionId === currentDiscussionId.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
    })

    s.on('unread_update', (data: { discussionId: number }) => {
      unreadCallbacks.current.forEach((cb) => cb(data))
    })

    setSocket(s)

    return () => {
      s.removeAllListeners()
      s.disconnect()
      setSocket(null)
      setConnectionStatus('disconnected')
    }
  }, [user])

  const sendMessage = useCallback(
    (discussionId: number, content: string) => {
      if (!socket || !content.trim()) return
      socket.emit('send_message', { discussionId, content: content.trim() })
    },
    [socket],
  )

  const loadMessages = useCallback(
    (discussionId: number) => {
      currentDiscussionId.current = discussionId
      setMessages([])
    },
    [],
  )

  const markRead = useCallback(
    (discussionId: number) => {
      if (!socket) return
      socket.emit('mark_read', { discussionId })
    },
    [socket],
  )

  const joinDiscussion = useCallback(
    (discussionId: number) => {
      if (!socket) return
      socket.emit('join_discussion', { discussionId })
    },
    [socket],
  )

  const onUnreadUpdate = useCallback(
    (callback: (data: { discussionId: number }) => void) => {
      unreadCallbacks.current.add(callback)
      return () => {
        unreadCallbacks.current.delete(callback)
      }
    },
    [],
  )

  return (
    <ChatContext.Provider
      value={{
        connectionStatus,
        messages,
        sendMessage,
        loadMessages,
        markRead,
        joinDiscussion,
        onUnreadUpdate,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
