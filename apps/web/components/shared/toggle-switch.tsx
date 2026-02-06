'use client'

import { cn } from '@nextrade/ui'

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
    <div className="inline-flex rounded-lg border border-border bg-background p-1">
      <button
        type="button"
        onClick={onClickLeft}
        className={cn(
          'rounded-md px-4 py-2 text-sm font-medium transition-all',
          isLeftActive
            ? 'bg-primary text-primary-foreground shadow-sm'
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
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {rightLabel}
      </button>
    </div>
  )
}
