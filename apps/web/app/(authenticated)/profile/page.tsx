'use client'

import { useState, FormEvent } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { MY_PROFILE_QUERY, MY_STATS_QUERY, UPDATE_PROFILE_MUTATION, MY_DEALS_QUERY } from '@/graphql/queries'
import { useAuthGuard } from '@/hooks/use-auth-guard'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, Button, Input, Label, Avatar, AvatarFallback, AvatarImage, Badge, Skeleton } from '@nextrade/ui'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuthGuard()

  const { data: profileData, loading: profileLoading } = useQuery(MY_PROFILE_QUERY, { skip: !user })
  const { data: statsData, loading: statsLoading } = useQuery(MY_STATS_QUERY, { skip: !user })
  const { data: dealsData } = useQuery(MY_DEALS_QUERY, { skip: !user })
  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION)
  const { toast } = useToast()

  const [name, setName] = useState(profileData?.myProfile?.name || '')
  const [saving, setSaving] = useState(false)

  if (authLoading) return null

  const profile = profileData?.myProfile
  const stats = statsData?.myStats
  const recentDeals = dealsData?.myDeals?.slice(0, 3) || []

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ variables: { name } })
      toast({ title: 'Profile updated', variant: 'success' })
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Stats Cards */}
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
        ) : stats ? (
          <>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{stats.totalDeals}</p>
                <p className="text-sm text-muted-foreground">Total Deals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">{stats.publishedDeals}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.soldDeals}</p>
                <p className="text-sm text-muted-foreground">Sold</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Edit Profile */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {profile?.image && <AvatarImage src={profile.image} />}
                  <AvatarFallback className="text-xl">{profile?.name?.charAt(0) || profile?.email?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile?.email}</p>
                  <Badge variant={profile?.role === 'ADMIN' ? 'default' : 'secondary'}>{profile?.role}</Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Deals</h2>
              <Link href="/deals/my" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            <div className="mt-4 space-y-3">
              {recentDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No deals yet</p>
              ) : (
                recentDeals.map((deal: any) => (
                  <Link key={deal.id} href={`/deals/${deal.id}/edit`} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.title || deal.products?.[0]?.productName || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">
                        {deal.status} · {deal.price ? `${deal.currency || 'USD'} ${Number(deal.price).toFixed(2)}` : 'No price'}
                      </p>
                    </div>
                    <Badge variant={deal.status === 'PUBLISHED' ? 'success' : deal.status === 'DRAFT' ? 'secondary' : 'outline'}>
                      {deal.status}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
