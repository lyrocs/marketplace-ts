'use client'

import { cn } from '@marketplace/ui'

interface ToggleSwitchProps {
  leftLabel: string
  rightLabel: string
  isLeftActive: boolean
  onClickLeft: () => void
  onClickRight: () => void
}

export function ToggleSwitch({
  leftLabel,
  rightLabel,
  isLeftActive,
  onClickLeft,
  onClickRight,
}: ToggleSwitchProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-secondary/50 p-1">
      <button
        type="button"
        onClick={onClickLeft}
        className={cn(
          'rounded-md px-4 py-2 text-sm font-medium transition-all',
          isLeftActive
            ? 'bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--neon-cyan)/0.3)]'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={onClickRight}
        className={cn(
          'rounded-md px-4 py-2 text-sm font-medium transition-all',
          !isLeftActive
            ? 'bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--neon-cyan)/0.3)]'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {rightLabel}
      </button>
    </div>
  )
}
