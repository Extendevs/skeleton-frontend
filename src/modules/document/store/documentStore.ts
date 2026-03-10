import type { IDocument } from '@/modules/document/schema'
import { createEntityStore } from '@/shared/store/EntityStore'

export const useDocumentStore = createEntityStore<IDocument>('document')
