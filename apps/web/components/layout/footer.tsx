import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="text-lg font-bold">NexTrade</span>
          <p className="text-sm text-muted-foreground">Your trusted marketplace for buying and selling.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:justify-end">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Browse</h4>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">Products</Link>
            <Link href="/deals" className="text-sm text-muted-foreground hover:text-foreground">Deals</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Account</h4>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign In</Link>
            <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">Sign Up</Link>
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">Forgot Password</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold">Help</h4>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container flex h-12 items-center justify-center">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} NexTrade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
