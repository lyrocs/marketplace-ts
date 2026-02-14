import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-background relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid opacity-[0.05]" />
        {/* Cyan orb */}
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-[hsl(185,100%,50%)] opacity-20 blur-[120px] animate-float" />
        {/* Purple orb */}
        <div className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full bg-[hsl(270,95%,65%)] opacity-20 blur-[120px] animate-float [animation-delay:3s]" />

        <div className="relative max-w-md text-center px-8">
          <h1 className="text-4xl font-bold text-gradient font-heading">Marketplace</h1>
          <p className="text-muted-foreground mt-4 text-lg">
            The fastest way to buy and sell FPV drone gear. Connect with pilots worldwide.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12 bg-background">
        <Link href="/" className="mb-8 lg:hidden">
          <span className="text-2xl font-bold text-gradient font-heading">Marketplace</span>
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
