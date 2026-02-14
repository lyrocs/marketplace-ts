import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface ProductBreadcrumbProps {
  items: BreadcrumbItem[]
  title: string
}

export function ProductBreadcrumb({ items, title }: ProductBreadcrumbProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      {items.map((item, i) => (
        <span key={i} className="flex items-baseline gap-x-2">
          <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
            {item.label}
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0 relative top-[1px]" />
        </span>
      ))}
      <h1 className="text-3xl font-bold text-foreground font-heading">{title}</h1>
    </div>
  )
}
