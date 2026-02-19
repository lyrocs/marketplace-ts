'use client'

import { cn } from '@marketplace/ui'

const STEPS = ['Products', 'Photos', 'Details', 'Delivery'] as const

interface DealStepperNavProps {
  currentStep: number
  completedUpTo: number
  freeNavigate: boolean
  onStepClick: (index: number) => void
}

export function DealStepperNav({
  currentStep,
  completedUpTo,
  freeNavigate,
  onStepClick,
}: DealStepperNavProps) {
  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="relative h-1 w-full rounded-full bg-muted mb-6">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((label, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isClickable = freeNavigate || index <= completedUpTo

          return (
            <button
              key={label}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick(index)}
              className={cn(
                'flex flex-col items-center gap-1.5 group',
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40',
              )}
            >
              {/* Circle */}
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  isActive && 'border-primary bg-primary text-primary-foreground',
                  isCompleted && 'border-primary bg-primary/10 text-primary',
                  !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground',
                  isClickable && !isActive && 'group-hover:border-primary/60',
                )}
              >
                {index + 1}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                  isClickable && !isActive && 'group-hover:text-foreground',
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
