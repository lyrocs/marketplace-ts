'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as sdk from 'matrix-js-sdk'
import { useAuth } from './use-auth'

interface MatrixMessage {
  eventId: string
  sender: string
  body: string
  timestamp: number
}

interface UseMatrixResult {
  client: sdk.MatrixClient | null
  messages: MatrixMessage[]
  loading: boolean
  error: string | null
  sendMessage: (roomId: string, text: string) => Promise<void>
  loadMessages: (roomId: string) => Promise<void>
}

export function useMatrix(): UseMatrixResult {
  const { user } = useAuth()
  const [client, setClient] = useState<sdk.MatrixClient | null>(null)
  const [messages, setMessages] = useState<MatrixMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentRoomId = useRef<string | null>(null)

  // Initialize Matrix client
  useEffect(() => {
    if (!user?.matrixLogin || !user?.matrixPassword) {
      setLoading(false)
      return
    }

    const matrixHost = process.env.NEXT_PUBLIC_MATRIX_HOST
    if (!matrixHost) {
      setError('Matrix host not configured')
      setLoading(false)
      return
    }

    const initMatrix = async () => {
      try {
        // Login to Matrix
        const baseUrl = `https://${matrixHost}`
        const response = await fetch(`${baseUrl}/_matrix/client/v3/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'm.login.password',
            user: user.matrixLogin,
            password: user.matrixPassword,
          }),
        })

        if (!response.ok) {
          throw new Error('Matrix login failed')
        }

        const data = await response.json()
        const matrixClient = sdk.createClient({
          baseUrl,
          accessToken: data.access_token,
          userId: data.user_id,
        })

        await matrixClient.startClient({ initialSyncLimit: 10 })

        // Listen for new messages
        matrixClient.on(sdk.RoomEvent.Timeline, (event: any, room: any, toStartOfTimeline: boolean) => {
          if (toStartOfTimeline || event.getType() !== 'm.room.message') return
          if (room.roomId !== currentRoomId.current) return

          const message: MatrixMessage = {
            eventId: event.getId() || '',
            sender: event.getSender() || '',
            body: event.getContent().body || '',
            timestamp: event.getTs() || Date.now(),
          }

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.eventId === message.eventId)) return prev
            return [...prev, message]
          })
        })

        setClient(matrixClient)
        setLoading(false)
      } catch (err: any) {
        console.error('Matrix initialization error:', err)
        setError(err.message || 'Failed to initialize Matrix')
        setLoading(false)
      }
    }

    initMatrix()

    return () => {
      if (client) {
        client.stopClient()
      }
    }
  }, [user?.matrixLogin, user?.matrixPassword])

  const loadMessages = useCallback(
    async (roomId: string) => {
      if (!client) return

      try {
        currentRoomId.current = roomId
        setMessages([])
        setLoading(true)

        // Wait for client to sync
        await new Promise((resolve) => {
          if (client.isInitialSyncComplete()) {
            resolve(true)
          } else {
            client.once(sdk.ClientEvent.Sync, (state: any) => {
              if (state === 'PREPARED') resolve(true)
            })
          }
        })

        const room = client.getRoom(roomId)
        if (!room) {
          console.warn('Room not found:', roomId)
          setLoading(false)
          return
        }

        // Get timeline events
        const timeline = room.getLiveTimeline()
        const events = timeline.getEvents()

        const msgs: MatrixMessage[] = events
          .filter((e) => e.getType() === 'm.room.message')
          .map((e) => ({
            eventId: e.getId() || '',
            sender: e.getSender() || '',
            body: e.getContent().body || '',
            timestamp: e.getTs() || 0,
          }))

        setMessages(msgs)
        setLoading(false)
      } catch (err: any) {
        console.error('Error loading messages:', err)
        setError(err.message || 'Failed to load messages')
        setLoading(false)
      }
    },
    [client]
  )

  const sendMessage = useCallback(
    async (roomId: string, text: string) => {
      if (!client || !text.trim()) return

      try {
        await client.sendTextMessage(roomId, text.trim())
      } catch (err: any) {
        console.error('Error sending message:', err)
        setError(err.message || 'Failed to send message')
        throw err
      }
    },
    [client]
  )

  return {
    client,
    messages,
    loading,
    error,
    sendMessage,
    loadMessages,
  }
}
