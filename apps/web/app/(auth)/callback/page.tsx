'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@marketplace/ui'

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refetch } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      // Redirect to login with error message
      router.push(`/login?error=${error}`)
      return
    }

    if (token) {
      // Store token in localStorage
      localStorage.setItem('marketplace_token', token)

      // Refresh auth state (this will trigger the ME_QUERY)
      if (refetch) {
        refetch().catch(() => {})
      }

      // Redirect to home page
      setTimeout(() => {
        router.push('/')
      }, 500)
    } else {
      // No token, redirect to login
      router.push('/login')
    }
  }, [searchParams, router, refetch])

  return (
    <Card>
      <CardContent className="pt-6 text-center py-12">
        <div className="text-5xl mb-4">🔄</div>
        <h1 className="text-2xl font-bold">Signing you in...</h1>
        <p className="text-muted-foreground mt-2">Please wait while we complete the authentication.</p>
      </CardContent>
    </Card>
  )
}
