'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import {
  CREATE_DEAL_DRAFT_MUTATION,
  UPDATE_DEAL_MUTATION,
  PUBLISH_DEAL_MUTATION,
  MARK_DEAL_SOLD_MUTATION,
  ADD_DEAL_IMAGE_MUTATION,
  DELETE_DEAL_IMAGE_MUTATION,
} from '@/graphql/queries'
import { useToast } from '@/hooks/use-toast'
import { ImageUpload } from '@/components/shared/image-upload'
import { DealProductPicker } from '@/components/deal/deal-product-picker'
import { DealStepperNav } from '@/components/deal/deal-stepper-nav'
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
} from '@marketplace/ui'

const TOTAL_STEPS = 4

interface DealFormStepperProps {
  mode: 'create' | 'edit'
  dealId?: number
  initialData?: {
    title: string
    description: string
    location: string
    currency: string
    price: string
    condition: string
    invoiceAvailable: boolean
    canBeDelivered: boolean
    sellingReason: string
    images: string[]
    selectedProducts: { productId: number; quantity: number }[]
    status: string
    reasonDeclined?: string
  }
}

export function DealFormStepper({ mode, dealId: initialDealId, initialData }: DealFormStepperProps) {
  const router = useRouter()
  const { toast } = useToast()

  // Step state
  const [currentStep, setCurrentStep] = useState(0)
  const [completedUpTo, setCompletedUpTo] = useState(mode === 'edit' ? TOTAL_STEPS - 1 : 0)

  // Deal ID (set on mount for create, passed in for edit)
  const [dealId, setDealId] = useState<number | null>(initialDealId ?? null)

  // Form state
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [location, setLocation] = useState(initialData?.location ?? '')
  const [currency, setCurrency] = useState(initialData?.currency ?? 'USD')
  const [price, setPrice] = useState(initialData?.price ?? '')
  const [condition, setCondition] = useState(initialData?.condition ?? 'GOOD')
  const [invoiceAvailable, setInvoiceAvailable] = useState(initialData?.invoiceAvailable ?? false)
  const [canBeDelivered, setCanBeDelivered] = useState(initialData?.canBeDelivered ?? false)
  const [sellingReason, setSellingReason] = useState(initialData?.sellingReason ?? '')
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [selectedProducts, setSelectedProducts] = useState<{ productId: number; quantity: number }[]>(
    initialData?.selectedProducts ?? [],
  )
  const [saving, setSaving] = useState(false)

  const status = initialData?.status ?? 'DRAFT'
  const reasonDeclined = initialData?.reasonDeclined

  // Mutations
  const [createDraft] = useMutation(CREATE_DEAL_DRAFT_MUTATION)
  const [updateDeal] = useMutation(UPDATE_DEAL_MUTATION)
  const [publishDeal] = useMutation(PUBLISH_DEAL_MUTATION)
  const [markDealSold] = useMutation(MARK_DEAL_SOLD_MUTATION)
  const [addImage] = useMutation(ADD_DEAL_IMAGE_MUTATION)
  const [deleteImage] = useMutation(DELETE_DEAL_IMAGE_MUTATION)

  // Create draft on mount (create mode only)
  useEffect(() => {
    if (mode === 'create' && !dealId) {
      createDraft().then(({ data }) => {
        if (data?.createDealDraft) setDealId(data.createDealDraft.id)
      })
    }
  }, [mode, dealId, createDraft])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!dealId) return
    setSaving(true)
    try {
      await updateDeal({
        variables: {
          id: dealId,
          title,
          description,
          location,
          currency,
          price: price ? parseFloat(price) : undefined,
          invoiceAvailable,
          canBeDelivered,
          sellingReason,
          condition,
          products: selectedProducts,
        },
      })
      if (mode === 'edit') {
        toast({ title: 'Deal saved', variant: 'success' })
      }
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }, [
    dealId, title, description, location, currency, price,
    invoiceAvailable, canBeDelivered, sellingReason, condition,
    selectedProducts, updateDeal, toast, mode,
  ])

  // Image handlers
  const handleAddImage = async (url: string) => {
    if (dealId) {
      await addImage({ variables: { dealId, imageUrl: url } })
      setImages((prev) => [...prev, url])
    }
  }

  const handleRemoveImage = async (url: string) => {
    if (dealId) {
      await deleteImage({ variables: { dealId, imageUrl: url } })
      setImages((prev) => prev.filter((img) => img !== url))
    }
  }

  // Navigation handlers
  const handleNext = async () => {
    await handleSave()
    const next = currentStep + 1
    setCurrentStep(next)
    setCompletedUpTo((prev) => Math.max(prev, next))
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleStepClick = async (index: number) => {
    if (index === currentStep) return
    await handleSave()
    setCurrentStep(index)
    setCompletedUpTo((prev) => Math.max(prev, index))
  }

  const handleSubmitForReview = async () => {
    if (!dealId) return
    await handleSave()
    try {
      await publishDeal({ variables: { id: dealId } })
      toast({ title: 'Deal submitted for review!', variant: 'success' })
      router.push('/deals')
    } catch {
      toast({ title: 'Failed to submit', variant: 'destructive' })
    }
  }

  const handleMarkSold = async () => {
    if (!dealId) return
    try {
      await markDealSold({ variables: { id: dealId } })
      toast({ title: 'Deal marked as sold!', variant: 'success' })
      router.push('/deals')
    } catch {
      toast({ title: 'Failed to mark as sold', variant: 'destructive' })
    }
  }

  const handleSaveChanges = async () => {
    await handleSave()
  }

  const isLastStep = currentStep === TOTAL_STEPS - 1

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Create a Deal' : 'Edit Deal'}
          </h1>
          {mode === 'create' ? (
            <p className="text-muted-foreground mt-1">Fill in the details and publish when ready</p>
          ) : (
            <p className="text-muted-foreground mt-1">
              Deal #{dealId} · Status:{' '}
              <Badge
                variant={
                  (status === 'PUBLISHED'
                    ? 'success'
                    : status === 'PENDING'
                      ? 'warning'
                      : status === 'DECLINED'
                        ? 'destructive'
                        : status === 'SOLD'
                          ? 'default'
                          : 'secondary') as any
                }
              >
                {status === 'PENDING'
                  ? 'Pending Review'
                  : status === 'PUBLISHED'
                    ? 'Published'
                    : status === 'DECLINED'
                      ? 'Declined'
                      : status === 'SOLD'
                        ? 'Sold'
                        : status === 'DRAFT'
                          ? 'Draft'
                          : status.toLowerCase()}
              </Badge>
            </p>
          )}
        </div>
        {mode === 'edit' && (
          <div className="flex gap-2">
            {(status === 'PUBLISHED' || status === 'SOLD') && (
              <Button variant="outline" onClick={() => router.push(`/deal/${dealId}`)}>
                {status === 'SOLD' ? 'View Deal' : 'View Live Deal'}
              </Button>
            )}
            {status === 'PUBLISHED' && (
              <Button variant="outline" onClick={handleMarkSold}>
                Mark as Sold
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Status cards */}
      {mode === 'edit' && status === 'PENDING' && (
        <Card className="mb-6 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Your deal is being reviewed by our team. You will be notified once it is approved or if
              changes are needed.
            </p>
          </CardContent>
        </Card>
      )}

      {mode === 'edit' && status === 'DECLINED' && reasonDeclined && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-destructive mb-2">Deal Declined</h2>
            <p className="text-sm text-muted-foreground">{reasonDeclined}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please address the issues above and save your changes before resubmitting.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stepper nav */}
      <div className="mb-8">
        <DealStepperNav
          currentStep={currentStep}
          completedUpTo={completedUpTo}
          freeNavigate={mode === 'edit'}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Step content */}
      <div className="space-y-6">
        {currentStep === 0 && (
          <StepProducts
            selectedProducts={selectedProducts}
            onProductsChange={setSelectedProducts}
          />
        )}
        {currentStep === 1 && (
          <StepPhotos
            images={images}
            onImageAdded={handleAddImage}
            onImageRemoved={handleRemoveImage}
          />
        )}
        {currentStep === 2 && (
          <StepDetails
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            price={price}
            setPrice={setPrice}
            currency={currency}
            setCurrency={setCurrency}
            condition={condition}
            setCondition={setCondition}
            sellingReason={sellingReason}
            setSellingReason={setSellingReason}
          />
        )}
        {currentStep === 3 && (
          <StepDelivery
            canBeDelivered={canBeDelivered}
            setCanBeDelivered={setCanBeDelivered}
            location={location}
            setLocation={setLocation}
            invoiceAvailable={invoiceAvailable}
            setInvoiceAvailable={setInvoiceAvailable}
          />
        )}
      </div>

      {/* Action bar */}
      <DealFormActions
        mode={mode}
        status={status}
        currentStep={currentStep}
        isLastStep={isLastStep}
        saving={saving}
        onCancel={() => router.push('/deals')}
        onBack={handleBack}
        onNext={handleNext}
        onSave={handleSaveChanges}
        onSubmitForReview={handleSubmitForReview}
      />
    </div>
  )
}

// ─── Step Sub-Components ─────────────────────────────────────────────────────

function StepProducts({
  selectedProducts,
  onProductsChange,
}: {
  selectedProducts: { productId: number; quantity: number }[]
  onProductsChange: (products: { productId: number; quantity: number }[]) => void
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Products</h2>
        <DealProductPicker selectedProducts={selectedProducts} onProductsChange={onProductsChange} />
      </CardContent>
    </Card>
  )
}

function StepPhotos({
  images,
  onImageAdded,
  onImageRemoved,
}: {
  images: string[]
  onImageAdded: (url: string) => void
  onImageRemoved: (url: string) => void
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4">Photos</h2>
        <ImageUpload images={images} onImageAdded={onImageAdded} onImageRemoved={onImageRemoved} />
      </CardContent>
    </Card>
  )
}

function StepDetails({
  title,
  setTitle,
  description,
  setDescription,
  price,
  setPrice,
  currency,
  setCurrency,
  condition,
  setCondition,
  sellingReason,
  setSellingReason,
}: {
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  price: string
  setPrice: (v: string) => void
  currency: string
  setCurrency: (v: string) => void
  condition: string
  setCondition: (v: string) => void
  sellingReason: string
  setSellingReason: (v: string) => void
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deal title" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the deal..."
                rows={5}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Price</Label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="PLN">PLN (zł)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Condition</h2>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="LIKE_NEW">Like New</SelectItem>
              <SelectItem value="GOOD">Good</SelectItem>
              <SelectItem value="FAIR">Fair</SelectItem>
              <SelectItem value="POOR">Poor</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-4 space-y-1.5">
            <Label>Selling Reason (optional)</Label>
            <Textarea
              value={sellingReason}
              onChange={(e) => setSellingReason(e.target.value)}
              placeholder="Why are you selling?"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StepDelivery({
  canBeDelivered,
  setCanBeDelivered,
  location,
  setLocation,
  invoiceAvailable,
  setInvoiceAvailable,
}: {
  canBeDelivered: boolean
  setCanBeDelivered: (v: boolean) => void
  location: string
  setLocation: (v: string) => void
  invoiceAvailable: boolean
  setInvoiceAvailable: (v: boolean) => void
}) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Delivery & Location</h2>
        <div className="flex items-center gap-3">
          <Switch checked={canBeDelivered} onCheckedChange={setCanBeDelivered} />
          <Label>Can be delivered</Label>
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={invoiceAvailable} onCheckedChange={setInvoiceAvailable} />
          <Label>Invoice available</Label>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Action Bar ──────────────────────────────────────────────────────────────

function DealFormActions({
  mode,
  status,
  currentStep,
  isLastStep,
  saving,
  onCancel,
  onBack,
  onNext,
  onSave,
  onSubmitForReview,
}: {
  mode: 'create' | 'edit'
  status: string
  currentStep: number
  isLastStep: boolean
  saving: boolean
  onCancel: () => void
  onBack: () => void
  onNext: () => void
  onSave: () => void
  onSubmitForReview: () => void
}) {
  const showSubmitForReview =
    isLastStep && (mode === 'create' || status === 'DRAFT' || status === 'DECLINED')
  const showSaveChanges =
    isLastStep && mode === 'edit' && status !== 'DRAFT' && status !== 'DECLINED'

  return (
    <div className="flex items-center justify-between mt-8">
      <Button variant="outline" type="button" onClick={onCancel}>
        Cancel
      </Button>

      <div className="flex gap-3">
        {currentStep > 0 && (
          <Button variant="outline" type="button" onClick={onBack}>
            Back
          </Button>
        )}

        {!isLastStep && (
          <Button type="button" onClick={onNext} disabled={saving}>
            {saving ? 'Saving...' : 'Next'}
          </Button>
        )}

        {showSaveChanges && (
          <Button variant="outline" type="button" onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}

        {showSubmitForReview && (
          <Button type="button" onClick={onSubmitForReview} disabled={saving}>
            {saving
              ? 'Saving...'
              : status === 'DECLINED'
                ? 'Save & Resubmit for Review'
                : 'Submit for Review'}
          </Button>
        )}
      </div>
    </div>
  )
}
