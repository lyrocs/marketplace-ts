'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { REQUEST_PASSWORD_RESET_MUTATION } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import { Button, Input, Label, Card, CardContent } from '@nextrade/ui'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()
  const [requestReset] = useMutation(REQUEST_PASSWORD_RESET_MUTATION)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await requestReset({ variables: { email } })
      setSent(true)
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground mt-2">
            We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
          </p>
          <Link href="/login" className="mt-6 inline-block text-primary hover:underline">
            Back to Sign In
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>
        <p className="text-center text-muted-foreground mt-1">
          Enter your email and we'll send you a reset link
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
