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
      <div className="rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 p-12 text-center shadow-xl">
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-slate-200">{description}</p>
        <Link href={buttonHref}>
          <Button
            size="lg"
            className="mt-6 bg-white text-slate-800 hover:bg-slate-100"
          >
            {buttonText}
          </Button>
        </Link>
      </div>
    </section>
  )
}
