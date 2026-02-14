import { ReactNode } from 'react'

interface FeatureIconProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureIcon({ icon, title, description }: FeatureIconProps) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</div>
      <h3 className="mt-4 text-xl font-bold text-foreground font-heading">{title}</h3>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </div>
  )
}
