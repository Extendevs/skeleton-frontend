import { ERoleUserSlug } from '@/shared/interfaces/Entity'

export interface SessionUser {
  id: string
  email: string
  name?: string
  [key: string]: unknown
}

export interface SessionTenant {
  id: string
  name: string
  tenant_payment_type_id: string | null
  subscription_plan_id: string | null
  payment_type?: { id: string; name: string } | null
}

export type SubscriptionStatus =
  | 'none'
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'exempt'

export interface SubscriptionState {
  status: SubscriptionStatus
  is_blocked: boolean
  is_owner: boolean
}

export interface SessionProfile {
  user: SessionUser
  abilities: string[]
  roles: ERoleUserSlug[]
  company?: Record<string, unknown> | null
  country?: Record<string, unknown> | null
  tenant?: SessionTenant | null
  subscription?: SubscriptionState | null
}
