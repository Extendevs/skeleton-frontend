import { CheckoutSubscriptionResource } from '@/modules/checkoutSubscription/services/CheckoutSubscriptionResource'
import type { ISubscriptionPlan } from '@/modules/subscriptionPlan/schema'
import { fetchSessionProfile } from '@/shared/auth/authService'
import { sessionStore } from '@/shared/auth/sessionStore'
import { toast } from '@/shared/hooks/useToast'
import { useCallback, useEffect, useState } from 'react'

export interface SubscriptionDetails {
  plan: ISubscriptionPlan | null
  subscription: {
    stripe_status: string
    current_period_start: string | null
    current_period_end: string | null
    trial_ends_at: string | null
    ends_at: string | null
    cancel_at_period_end: boolean
  } | null
}

export function useSubscription() {
  const [details, setDetails] = useState<SubscriptionDetails | null>(null)
  const [availablePlans, setAvailablePlans] = useState<ISubscriptionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPlans, setIsLoadingPlans] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isChangingPlan, setIsChangingPlan] = useState<string | null>(null)

  const refreshSession = useCallback(async () => {
    try {
      const profile = await fetchSessionProfile()
      sessionStore.getState().setProfile(profile)
    } catch {
      /* session refresh failed, non-critical */
    }
  }, [])

  const loadDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await CheckoutSubscriptionResource.getMySubscription()
      setDetails(data)
    } catch {
      toast.error('Error', 'No se pudo cargar la información de tu suscripción.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadPlans = useCallback(async () => {
    setIsLoadingPlans(true)
    try {
      const plans = await CheckoutSubscriptionResource.getPlans()
      setAvailablePlans(plans)
    } catch {
      toast.error('Error', 'No se pudieron cargar los planes disponibles.')
    } finally {
      setIsLoadingPlans(false)
    }
  }, [])

  useEffect(() => {
    loadDetails()
    loadPlans()
  }, [loadDetails, loadPlans])

  const handleCancel = useCallback(
    async (atPeriodEnd: boolean) => {
      setIsCanceling(true)
      try {
        await CheckoutSubscriptionResource.cancelSubscription(atPeriodEnd)
        toast.success(
          'Suscripción cancelada',
          atPeriodEnd
            ? 'Tu plan se cancelará al final del ciclo de facturación.'
            : 'Tu suscripción ha sido cancelada inmediatamente.',
        )
        await Promise.all([loadDetails(), refreshSession()])
      } catch {
        toast.error('Error', 'No se pudo cancelar la suscripción.')
      } finally {
        setIsCanceling(false)
      }
    },
    [loadDetails, refreshSession],
  )

  const handleChangePlan = useCallback(
    async (planId: string) => {
      setIsChangingPlan(planId)
      try {
        await CheckoutSubscriptionResource.changePlan(planId)
        toast.success('Plan actualizado', 'Tu plan ha sido cambiado correctamente.')
        await Promise.all([loadDetails(), refreshSession()])
      } catch {
        toast.error('Error', 'No se pudo cambiar el plan.')
      } finally {
        setIsChangingPlan(null)
      }
    },
    [loadDetails, refreshSession],
  )

  const handlePortal = useCallback(async () => {
    try {
      const url = await CheckoutSubscriptionResource.getPortalUrl()
      window.location.href = url
    } catch {
      toast.error('Error', 'No se pudo abrir el portal de facturación.')
    }
  }, [])

  return {
    details,
    availablePlans,
    isLoading,
    isLoadingPlans,
    isCanceling,
    isChangingPlan,
    handleCancel,
    handleChangePlan,
    handlePortal,
    reload: loadDetails,
  }
}
