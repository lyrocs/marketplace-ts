import { notFound } from 'next/navigation'
import { fetchGraphQL } from '@/lib/graphql-server'
import { PUBLIC_PROFILE_QUERY, USER_DEALS_QUERY } from '@/graphql/queries'
import { DealCard } from '@/components/cards/deal-card'
import { Avatar, AvatarFallback, AvatarImage } from '@marketplace/ui'
import { CalendarDays, Package, CheckCircle2, Tag } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const data = await fetchGraphQL(PUBLIC_PROFILE_QUERY, { id })
    const profile = data?.publicProfile
    if (!profile) return { title: 'User Not Found' }
    return {
      title: `${profile.name || 'Pilot'} — Marketplace`,
      description: `Check out ${profile.name || 'this pilot'}'s profile and deals on the FPV Marketplace.`,
    }
  } catch {
    return { title: 'User Not Found' }
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params

  let profileData: any
  let dealsData: any
  try {
    ;[profileData, dealsData] = await Promise.all([
      fetchGraphQL(PUBLIC_PROFILE_QUERY, { id }),
      fetchGraphQL(USER_DEALS_QUERY, { userId: id }),
    ])
  } catch {
    notFound()
  }

  const profile = profileData?.publicProfile
  if (!profile) notFound()

  const deals = dealsData?.userDeals || []
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="container max-w-5xl py-8 md:py-12">
      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-24 w-24 border-2 border-primary/30">
            {profile.image && <AvatarImage src={profile.image} />}
            <AvatarFallback className="text-3xl font-heading bg-primary/10 text-primary">
              {profile.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-bold font-heading">{profile.name || 'Anonymous Pilot'}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Member since {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="rounded-xl bg-white/5 border border-border/50 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold font-mono text-primary">{profile.totalDeals}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Deals</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-border/50 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-[hsl(var(--neon-green))]" />
            </div>
            <p className="text-2xl font-bold font-mono text-[hsl(var(--neon-green))]">{profile.publishedDeals}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-border/50 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </div>
            <p className="text-2xl font-bold font-mono text-accent">{profile.soldDeals}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sold</p>
          </div>
        </div>
      </div>

      {/* User's Deals */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold font-heading mb-6">
          {deals.length > 0 ? 'Active Listings' : 'No Active Listings'}
        </h2>
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {deals.map((deal: any) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="mt-4 text-muted-foreground">This pilot doesn't have any active listings right now.</p>
          </div>
        )}
      </section>
    </div>
  )
}
