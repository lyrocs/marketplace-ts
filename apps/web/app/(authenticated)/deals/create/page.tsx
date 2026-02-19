'use client'

import { useAuthGuard } from '@/hooks/use-auth-guard'
import { DealFormStepper } from '@/components/deal/deal-form-stepper'

export default function CreateDealPage() {
  const { loading: authLoading } = useAuthGuard()

  if (authLoading) return null

  return <DealFormStepper mode="create" />
}
