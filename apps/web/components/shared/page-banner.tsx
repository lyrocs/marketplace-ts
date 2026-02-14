interface PageBannerProps {
  title: string
  description: string
  backgroundImage?: string
  children?: React.ReactNode
}

export function PageBanner({ title, description, backgroundImage, children }: PageBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[hsl(185,100%,50%,0.1)] via-card to-[hsl(270,95%,65%,0.1)] px-6 py-12 md:px-12"
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />

      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/80" />
      )}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl font-heading text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">{description}</p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  )
}
