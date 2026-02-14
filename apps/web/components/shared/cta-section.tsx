import Link from 'next/link'
import { Button } from '@marketplace/ui'

interface CTASectionProps {
  title: string
  description: string
  buttonText: string
  buttonHref: string
}

export function CTASection({ title, description, buttonText, buttonHref }: CTASectionProps) {
  return (
    <section className="mt-20">
      <div className="rounded-2xl bg-gradient-to-r from-[hsl(185,100%,50%,0.15)] via-card to-[hsl(270,95%,65%,0.15)] border border-border/50 p-12 text-center">
        <h2 className="text-3xl font-bold text-foreground font-heading">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{description}</p>
        <Link href={buttonHref}>
          <Button
            size="lg"
            className="mt-6 bg-gradient-to-r from-[hsl(185,100%,50%)] to-[hsl(270,95%,65%)] text-white hover:opacity-90 border-0"
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </section>
  )
}
