'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as sdk from 'matrix-js-sdk'
import { useAuth } from './use-auth'

export interface MatrixMessage {
  eventId: string
  sender: string
  body: string
  timestamp: number
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface UseMatrixResult {
  client: sdk.MatrixClient | null
  messages: MatrixMessage[]
  loading: boolean
  error: string | null
  connectionStatus: ConnectionStatus
  sendMessage: (roomId: string, text: string) => Promise<void>
  loadMessages: (roomId: string) => Promise<void>
  disconnect: () => void
}

export function useMatrix(): UseMatrixResult {
  const { user } = useAuth()
  const [client, setClient] = useState<sdk.MatrixClient | null>(null)
  const [messages, setMessages] = useState<MatrixMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const currentRoomId = useRef<string | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 3

  // Initialize Matrix client
  useEffect(() => {
    if (!user?.matrixLogin || !user?.matrixPassword) {
      setLoading(false)
      setConnectionStatus('disconnected')
      return
    }

    const matrixHost = process.env.NEXT_PUBLIC_MATRIX_HOST
    if (!matrixHost) {
      setError('Matrix host not configured')
      setLoading(false)
      setConnectionStatus('error')
      return
    }

    let matrixClient: sdk.MatrixClient | null = null

    const initMatrix = async () => {
      try {
        setConnectionStatus('connecting')

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
        matrixClient = sdk.createClient({
          baseUrl,
          accessToken: data.access_token,
          userId: data.user_id,
        })

        // Listen for sync state changes
        matrixClient.on(sdk.ClientEvent.Sync, (state: any) => {
          if (state === 'PREPARED' || state === 'SYNCING') {
            setConnectionStatus('connected')
            reconnectAttempts.current = 0
          } else if (state === 'ERROR') {
            setConnectionStatus('error')
            // Attempt reconnect
            if (reconnectAttempts.current < maxReconnectAttempts) {
              reconnectAttempts.current++
              console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
              setTimeout(() => {
                matrixClient?.startClient({ initialSyncLimit: 10 })
              }, reconnectAttempts.current * 2000)
            }
          }
        })

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
            return [...prev, message].sort((a, b) => a.timestamp - b.timestamp)
          })
        })

        await matrixClient.startClient({ initialSyncLimit: 10 })

        setClient(matrixClient)
        setLoading(false)
      } catch (err: any) {
        console.error('Matrix initialization error:', err)
        setError(err.message || 'Failed to initialize Matrix')
        setLoading(false)
        setConnectionStatus('error')
      }
    }

    initMatrix()

    return () => {
      if (matrixClient) {
        matrixClient.removeAllListeners()
        matrixClient.stopClient()
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
          .sort((a, b) => a.timestamp - b.timestamp)

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

  const disconnect = useCallback(() => {
    if (client) {
      client.removeAllListeners()
      client.stopClient()
      setClient(null)
      setConnectionStatus('disconnected')
    }
  }, [client])

  return {
    client,
    messages,
    loading,
    error,
    connectionStatus,
    sendMessage,
    loadMessages,
    disconnect,
  }
}
