import type { IDocumentType } from '@/modules/documentType/schema'
import type { IEntity } from '@/shared/interfaces/Entity'
import { z } from 'zod'

export const documentFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  type_id: z.string().optional(),
  required: z.boolean().optional(),
  vigency: z.boolean().optional(),
})

export interface IDocument extends IEntity {
  name: string
  description?: string
  type_id: string
  required?: boolean
  vigency?: boolean
  type?: IDocumentType
}

export type DocumentFormValues = z.infer<typeof documentFormSchema>
