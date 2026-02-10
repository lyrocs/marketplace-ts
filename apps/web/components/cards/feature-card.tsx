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
      className="group block rounded-xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="mx-auto flex justify-center text-5xl text-slate-500">{icon}</div>
      <h2 className="mt-4 text-2xl font-bold text-gray-800">{title}</h2>
      <p className="mt-1 text-gray-600">{description}</p>
      <span className="mt-4 inline-block font-semibold text-slate-600 group-hover:text-primary transition-colors">
        {linkText} &rarr;
      </span>
    </Link>
  )
}
