import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-background overflow-hidden">
      {/* Decorative radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[hsl(185,100%,50%)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />

      <div className="container relative flex flex-col items-center justify-between gap-4 py-10 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="text-lg font-bold text-gradient font-heading">Marketplace</span>
          <p className="text-sm text-muted-foreground">Your trusted marketplace for FPV drone gear.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:justify-end">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wider font-heading">Browse</h4>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Products</Link>
            <Link href="/deals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Deals</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wider font-heading">Account</h4>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign Up</Link>
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Forgot Password</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wider font-heading">Help</h4>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="container flex h-12 items-center justify-center">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
