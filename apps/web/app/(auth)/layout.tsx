import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-primary">
        <div className="max-w-md text-center px-8">
          <h1 className="text-4xl font-bold text-white">Marketplace</h1>
          <p className="text-white/70 mt-4 text-lg">
            The fastest way to buy and sell. Connect with buyers and sellers in your area.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 py-12">
        <Link href="/" className="mb-8 lg:hidden">
          <span className="text-2xl font-bold text-primary">Marketplace</span>
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
