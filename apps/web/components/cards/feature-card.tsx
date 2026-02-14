import Link from 'next/link'
import { ReactNode } from 'react'

interface FeatureCardProps {
  href: string
  icon: ReactNode
  title: string
  description: string
  linkText: string
}

export function FeatureCard({ href, icon, title, description, linkText }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl glass-card glow-border p-8 transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="mx-auto flex justify-center text-5xl text-primary">{icon}</div>
      <h2 className="mt-4 text-2xl font-bold text-foreground font-heading">{title}</h2>
      <p className="mt-1 text-muted-foreground">{description}</p>
      <span className="mt-4 inline-block font-semibold text-muted-foreground group-hover:text-primary transition-colors">
        {linkText} &rarr;
      </span>
    </Link>
  )
}
