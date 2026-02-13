'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { START_DISCUSSION_MUTATION } from '@/graphql/queries'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@marketplace/ui'
import { MessageSquare } from 'lucide-react'

interface DealContactButtonProps {
  dealId: number
  sellerId: string
}

export function DealContactButton({ dealId, sellerId }: DealContactButtonProps) {
  const { user, isAuthenticated } = useAuth()
  const [startDiscussion] = useMutation(START_DISCUSSION_MUTATION)
  const [loading, setLoading] = useState(false)

  const isOwner = user?.id === sellerId

  if (!isAuthenticated || isOwner) return null

  const handleStartChat = async () => {
    setLoading(true)
    try {
      const { data: result } = await startDiscussion({ variables: { dealId } })
      if (result?.startDiscussion) {
        window.location.href = `/chat/${result.startDiscussion.id}`
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleStartChat} disabled={loading}>
      <MessageSquare className="mr-2 h-4 w-4" />
      {loading ? 'Opening...' : 'Contact Seller'}
    </Button>
  )
}
