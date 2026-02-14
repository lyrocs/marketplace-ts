interface ProductSectionProps {
  title: string
  children: React.ReactNode
}

export function ProductSection({ title, children }: ProductSectionProps) {
  return (
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-2xl font-bold text-foreground font-heading mb-4">{title}</h2>
      {children}
    </div>
  )
}
