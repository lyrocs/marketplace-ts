'use client'

import { useState, FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { RESET_PASSWORD_MUTATION } from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import { Button, Input, Label, Card, CardContent } from '@nextrade/ui'

export default function ResetPasswordPage() {
  const params = useParams()
  const token = params.token as string
  const router = useRouter()
  const { toast } = useToast()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [resetPassword] = useMutation(RESET_PASSWORD_MUTATION)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (password.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await resetPassword({ variables: { token, password } })
      setSuccess(true)
    } catch (err: any) {
      const message = err?.graphQLErrors?.[0]?.message || 'Invalid or expired token'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold">Password Updated</h1>
          <p className="text-muted-foreground mt-2">Your password has been successfully updated.</p>
          <Link href="/login" className="mt-6 inline-block">
            <Button>Sign In Now</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <p className="text-center text-muted-foreground mt-1">Enter your new password</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
