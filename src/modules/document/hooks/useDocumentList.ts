import type { IDocument } from '@/modules/document/schema'
import { DocumentResource } from '@/modules/document/services/DocumentResource'
import { useDocumentStore } from '@/modules/document/store/documentStore'
import { useBaseList } from '@/shared/hooks/useBaseList'

export function useDocumentList() {
  return useBaseList<IDocument>({
    store: useDocumentStore,
    resource: DocumentResource,
    autoInit: true,
    initialSearch: {
      sort: [{ field: 'name', direction: 'asc' }],
      includes: [
        { relation: 'type' },
      ],
    },
  })
}
