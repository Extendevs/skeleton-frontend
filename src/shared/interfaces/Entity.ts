import type { ICompany } from '@/modules/company/schema'
import { CrudMode } from '@/shared/enums/CrudMode'

export interface PaginatedResponse<T> {
  data: T[]
  total?: number
  meta?: {
    current_page: number
    per_page: number
    total: number
    last_page: number
    from: number | null
    to: number | null
    first_page_url?: string
    last_page_url?: string
    next_page_url?: string | null
    prev_page_url?: string | null
    path?: string
  }
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
}

export interface IEntity {
  id: string
  name?: string
  description?: string
  include?: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  media?: IMedia[]
  tenant_id?: string
  company?: ICompany
  _method?: string
  [key: string]: unknown
}

export interface IMedia {
  id: number
  uuid: string
  collection_name: string
  name: string
  file_name: string
  mime_type: string
  disk: string
  conversions_disk: string
  size: number
  manipulations: unknown[]
  custom_properties: unknown[]
  generated_conversions: unknown[]
  responsive_images: unknown[]
  order_column: number
  created_at: string
  updated_at: string
  model_type: string
  model_id: string
  original_url: string
  preview_url: string
}

export interface IFormProps<T> {
  entity?: Partial<T> | null
  mode: CrudMode
  onCancel?: () => void
  onSuccess?: (entity: T) => void
  formId?: string
}

//disable ts in this enum
export enum ERoleUserSlug {
  SUPER_ADMIN = 'admin.super',
  ACCOUNT_OWNER = 'account.owner',
  RH = 'admin.rh',
  COLLABORATOR = 'collaborator',
  AFFILIATE = 'affiliate',
  COMPANY_ADMIN = 'company.admin',
}

export const roleRoutes: Record<ERoleUserSlug, string> = {
  [ERoleUserSlug.SUPER_ADMIN]: '/user',
  [ERoleUserSlug.ACCOUNT_OWNER]: '/dashboard',
  [ERoleUserSlug.RH]: '/dashboard',
  [ERoleUserSlug.COLLABORATOR]: '/collaborator/me',
  [ERoleUserSlug.AFFILIATE]: '/affiliates',
  [ERoleUserSlug.COMPANY_ADMIN]: '/dashboard',
}
