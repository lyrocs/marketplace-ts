import { Skeleton } from '@marketplace/ui'

export default function Loading() {
  return (
    <div>
      {/* Hero Skeleton */}
      <div className="relative flex min-h-[60vh] flex-col items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 px-4">
        <div className="max-w-3xl w-full space-y-6">
          <Skeleton className="h-16 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
          <Skeleton className="h-12 w-96 mx-auto mt-8" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Feature Cards Skeleton */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </section>

        {/* Categories Skeleton */}
        <section className="mt-20">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </section>

        {/* Deals Skeleton */}
        <section className="mt-20">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
