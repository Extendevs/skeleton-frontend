import type { DocumentFormValues, IDocument } from '@/modules/document/schema'
import { createCrudApi } from '@/shared/api/resourceApi'

export const DocumentResource = createCrudApi<IDocument, DocumentFormValues>({
  basePath: '/document',
})
