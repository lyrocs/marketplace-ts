import { ReactNode } from 'react'

interface FeatureIconProps {
  icon: ReactNode
  title: string
  description: string
}

export function FeatureIcon({ icon, title, description }: FeatureIconProps) {
  return (
    <div className="text-center">
      <div className="mx-auto flex justify-center text-5xl text-slate-500">{icon}</div>
      <h3 className="mt-4 text-xl font-bold text-gray-800">{title}</h3>
      <p className="mt-1 text-gray-600">{description}</p>
    </div>
  )
}
