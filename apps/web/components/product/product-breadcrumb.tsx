interface ProductBreadcrumbProps {
  breadcrumb: string
  title: string
}

export function ProductBreadcrumb({ breadcrumb, title }: ProductBreadcrumbProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">{breadcrumb}</p>
      <h1 className="text-3xl font-bold text-foreground font-heading">{title}</h1>
    </div>
  )
}
