import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/modules/checkoutSubscription/components/formatPrice'
import { CancelSubscriptionModal } from '@/modules/user/components/CancelSubscriptionModal'
import { useSubscription } from '@/modules/user/hooks/useSubscription'
import { useRoles } from '@/shared/hooks/useRoles'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import type { ISubscriptionPlan } from '@/modules/subscriptionPlan/schema'
import {
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Activa',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  trialing: {
    label: 'Periodo de prueba',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  past_due: {
    label: 'Pago pendiente',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  canceled: {
    label: 'Cancelada',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  incomplete: {
    label: 'Incompleta',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  incomplete_expired: {
    label: 'Expirada',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  unpaid: {
    label: 'Sin pagar',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function CurrentPlanSection({
  plan,
  subscription,
  isStripe,
  onPortal,
  onChangePlan,
  onCancelPlan,
}: {
  plan: ISubscriptionPlan
  subscription: {
    stripe_status: string
    current_period_start: string | null
    current_period_end: string | null
    trial_ends_at: string | null
    ends_at: string | null
    cancel_at_period_end: boolean
  } | null
  isStripe: boolean
  onPortal: () => void
  onChangePlan: () => void
  onCancelPlan: () => void
}) {
  const statusInfo = subscription?.stripe_status
    ? STATUS_LABELS[subscription.stripe_status]
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Plan actual</CardTitle>
            <CardDescription>Detalles de tu suscripción</CardDescription>
          </div>
          {statusInfo && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.className}`}
            >
              {statusInfo.label}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            {plan.description && (
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            )}
          </div>
          <div className="text-right">
            {isStripe ? (
              <>
                <p className="text-3xl font-bold tracking-tight">
                  {formatPrice(plan.price, plan.currency)}
                </p>
                <p className="text-sm text-muted-foreground">
                  / {plan.interval === 'year' ? 'año' : 'mes'}
                </p>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Check className="h-4 w-4" />
                Plan gratuito
              </span>
            )}
          </div>
        </div>

        {isStripe && subscription && (
          <>
            {subscription.cancel_at_period_end && (
              <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Cancelación programada</p>
                  <p className="mt-0.5 text-sm">
                    Tu plan se cancelará el{' '}
                    {formatDate(subscription.ends_at ?? subscription.current_period_end)}. Mantendrás
                    acceso hasta esa fecha.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subscription.current_period_end && (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Próximo cobro</p>
                    <p className="text-sm font-semibold">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              )}
              {subscription.trial_ends_at && (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Fin del periodo de prueba
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDate(subscription.trial_ends_at)}
                    </p>
                  </div>
                </div>
              )}
              {subscription.current_period_start && (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Inicio del periodo
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDate(subscription.current_period_start)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {Array.isArray(plan.features) && plan.features.length > 0 && (
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Características incluidas
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 border-t pt-6">
          {isStripe && (
            <>
              <Button onClick={onChangePlan}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Cambiar de plan
              </Button>
              <Button variant="outline" onClick={onPortal}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Portal de facturación
              </Button>
              {!subscription?.cancel_at_period_end && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={onCancelPlan}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar suscripción
                </Button>
              )}
            </>
          )}
          {!isStripe && (
            <Button onClick={onChangePlan}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Cambiar de plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SubscriptionPage() {
  const isOwner = useRoles(ERoleUserSlug.ACCOUNT_OWNER)
  const navigate = useNavigate()
  const { details, isLoading, isCanceling, handleCancel, handlePortal } = useSubscription()

  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  const handleCancelConfirm = useCallback(
    async (atPeriodEnd: boolean) => {
      await handleCancel(atPeriodEnd)
      setCancelModalOpen(false)
    },
    [handleCancel],
  )

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Acceso restringido</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Solo el propietario de la cuenta puede gestionar la suscripción. Contacta al
          administrador de tu organización para realizar cambios.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const plan = details?.plan ?? null
  const subscription = details?.subscription ?? null
  const isStripe = plan?.is_stripe ?? false

  if (!plan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi suscripción</h1>
          <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCard className="mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Sin plan activo</h3>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Aún no tienes un plan asignado. Selecciona uno para comenzar.
            </p>
            <Button onClick={() => navigate('/change-plan')}>Seleccionar un plan</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi suscripción</h1>
        <p className="text-muted-foreground">Gestiona tu plan y facturación</p>
      </div>

      <CurrentPlanSection
        plan={plan}
        subscription={subscription}
        isStripe={isStripe}
        onPortal={handlePortal}
        onChangePlan={() => navigate('/change-plan')}
        onCancelPlan={() => setCancelModalOpen(true)}
      />

      <CancelSubscriptionModal
        isOpen={cancelModalOpen}
        isCanceling={isCanceling}
        onCancel={handleCancelConfirm}
        onClose={() => setCancelModalOpen(false)}
        planName={plan.name}
      />
    </div>
  )
}
