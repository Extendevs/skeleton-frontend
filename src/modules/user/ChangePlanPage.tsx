import { Button } from '@/components/ui/button'
import { BillingToggle } from '@/modules/checkoutSubscription/components/BillingToggle'
import { getNormalizedMonthlyPrice } from '@/modules/checkoutSubscription/components/formatPrice'
import { PlanCard } from '@/modules/checkoutSubscription/components/PlanCard'
import type { ISubscriptionPlan } from '@/modules/subscriptionPlan/schema'
import { useSubscription } from '@/modules/user/hooks/useSubscription'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { useRoles } from '@/shared/hooks/useRoles'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import { ArrowLeft, Loader2, Lock } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type DowngradeStep = 'persuade' | 'confirm'

export function ChangePlanPage() {
  const isOwner = useRoles(ERoleUserSlug.ACCOUNT_OWNER)
  const navigate = useNavigate()
  const { details, availablePlans, isLoading, isLoadingPlans, isChangingPlan, handleChangePlan } =
    useSubscription()

  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const [selectedPlan, setSelectedPlan] = useState<ISubscriptionPlan | null>(null)
  const [downgradeStep, setDowngradeStep] = useState<DowngradeStep>('persuade')
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false)

  const currentPlan = details?.plan ?? null
  const currentPlanId = currentPlan?.id ?? null

  const stripePlans = useMemo(() => availablePlans.filter((p) => p.is_stripe), [availablePlans])

  const hasMonthly = stripePlans.some((p) => p.interval === 'month')
  const hasYearly = stripePlans.some((p) => p.interval === 'year')
  const showToggle = hasMonthly && hasYearly

  const filteredPlans = showToggle
    ? stripePlans.filter((p) => p.interval === billingInterval)
    : stripePlans

  const maxSavings = useMemo(() => {
    if (!showToggle) return 0
    const monthlyPlans = stripePlans.filter((p) => p.interval === 'month')
    const yearlyPlans = stripePlans.filter((p) => p.interval === 'year')
    let max = 0
    for (const yearly of yearlyPlans) {
      const monthly = monthlyPlans.find((m) => m.name === yearly.name)
      if (!monthly) continue
      const annualized = monthly.price * 12
      if (annualized <= 0) continue
      const savings = ((annualized - yearly.price) / annualized) * 100
      max = Math.max(max, savings)
    }
    return Math.round(max)
  }, [stripePlans, showToggle])

  const isUpgrade = useMemo(() => {
    if (!selectedPlan || !currentPlan) return true
    return getNormalizedMonthlyPrice(selectedPlan) >= getNormalizedMonthlyPrice(currentPlan)
  }, [selectedPlan, currentPlan])

  const handleSelectPlan = useCallback(
    (plan: ISubscriptionPlan) => {
      setSelectedPlan(plan)

      if (!currentPlan) {
        setShowUpgradeConfirm(true)
        return
      }

      const currentMonthly = getNormalizedMonthlyPrice(currentPlan)
      const newMonthly = getNormalizedMonthlyPrice(plan)

      if (newMonthly >= currentMonthly) {
        setShowUpgradeConfirm(true)
      } else {
        setDowngradeStep('persuade')
      }
    },
    [currentPlan],
  )

  const handleConfirmChange = useCallback(async () => {
    if (!selectedPlan) return
    await handleChangePlan(selectedPlan.id)
    setSelectedPlan(null)
    setShowUpgradeConfirm(false)
    setDowngradeStep('persuade')
    navigate('/subscription')
  }, [selectedPlan, handleChangePlan, navigate])

  const handleCloseDialogs = useCallback(() => {
    setSelectedPlan(null)
    setShowUpgradeConfirm(false)
    setDowngradeStep('persuade')
  }, [])

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Solo el propietario de la cuenta puede cambiar el plan.
        </p>
      </div>
    )
  }

  if (isLoading || isLoadingPlans) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const showDowngradePersuade =
    selectedPlan !== null && !isUpgrade && !showUpgradeConfirm && downgradeStep === 'persuade'
  const showDowngradeConfirm =
    selectedPlan !== null && !isUpgrade && !showUpgradeConfirm && downgradeStep === 'confirm'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/subscription')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cambiar de plan</h1>
          <p className="text-muted-foreground">
            Al cambiar de plan se aplicará prorrateo automático. Solo pagarás la diferencia.
          </p>
        </div>
      </div>

      {showToggle && (
        <BillingToggle
          billingInterval={billingInterval}
          maxSavings={maxSavings}
          onIntervalChange={setBillingInterval}
        />
      )}

      {filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No hay planes disponibles en este momento.</p>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            filteredPlans.length === 1
              ? 'mx-auto max-w-md'
              : filteredPlans.length === 2
                ? 'mx-auto max-w-2xl grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCheckingOut={isChangingPlan}
              onSelect={handleSelectPlan}
              currentPlanId={currentPlanId}
              actionLabel="Cambiar a este plan"
            />
          ))}
        </div>
      )}

      {/* Upgrade: single confirmation */}
      <ConfirmDialog
        isOpen={showUpgradeConfirm}
        title={`Cambiar a ${selectedPlan?.name ?? ''}`}
        description="Se aplicará prorrateo automático sobre tu ciclo de facturación actual. ¿Deseas confirmar el cambio?"
        confirmLabel="Confirmar cambio de plan"
        isLoading={isChangingPlan !== null}
        onConfirm={handleConfirmChange}
        onCancel={handleCloseDialogs}
      />

      {/* Downgrade step 1: persuasive */}
      <ConfirmDialog
        isOpen={showDowngradePersuade}
        title="¿Cambiar a un plan con menos beneficios?"
        description={`Tu plan actual (${currentPlan?.name ?? ''}) tiene más funciones. Al cambiar a ${selectedPlan?.name ?? ''} podrías perder acceso a algunas características. ¿Deseas continuar?`}
        confirmLabel="Continuar con el cambio"
        cancelLabel="Mantener mi plan actual"
        isLoading={false}
        onConfirm={() => setDowngradeStep('confirm')}
        onCancel={handleCloseDialogs}
      />

      {/* Downgrade step 2: final confirm */}
      <ConfirmDialog
        isOpen={showDowngradeConfirm}
        title={`Confirmar cambio a ${selectedPlan?.name ?? ''}`}
        description="Se aplicará prorrateo automático. Tu nuevo plan será efectivo inmediatamente."
        confirmLabel="Confirmar cambio de plan"
        isLoading={isChangingPlan !== null}
        onConfirm={handleConfirmChange}
        onCancel={handleCloseDialogs}
      />
    </div>
  )
}
