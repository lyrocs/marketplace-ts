interface ProductSectionProps {
  title: string
  children: React.ReactNode
}

export function ProductSection({ title, children }: ProductSectionProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}
