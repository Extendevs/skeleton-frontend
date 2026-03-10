import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DocumentFormModal } from '@/modules/document/DocumentFormModal'
import { DocumentTableRow } from '@/modules/document/components/DocumentTableRow'
import { useDocumentList } from '@/modules/document/hooks/useDocumentList'
import type { IDocument } from '@/modules/document/schema'
import { useDocumentStore } from '@/modules/document/store/documentStore'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Pagination } from '@/shared/components/Pagination'
import { PermissionGuard } from '@/shared/components/PermissionGuard'
import { SearchList } from '@/shared/components/SearchList'
import { PageHeader } from '@/shared/components/atoms/PageHeader'
import { TableEmptyState } from '@/shared/components/molecules/TableEmptyState'
import { TableLoadingState } from '@/shared/components/molecules/TableLoadingState'
import { CrudMode } from '@/shared/enums/CrudMode'
import { useMultiplePermissions } from '@/shared/hooks/usePermissions'
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'

export const DocumentList = () => {
  const { onPageChanged, onRemove, onSearch, onReset, paramsSearch } = useDocumentList()
  const { entities, pagination, isLoading, isDeleting, isSaving } = useDocumentStore()

  const permissions = useMultiplePermissions({
    canCreate: 'create.document',
    canEdit: 'update.document',
    canDelete: 'delete.document',
    canReport: 'report.document',
    canRestore: 'restore.document',
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<CrudMode>(CrudMode.CREATE)
  const [selectedEntity, setSelectedEntity] = useState<IDocument | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [entityToDelete, setEntityToDelete] = useState<IDocument | null>(null)

  const handleCreate = useCallback(() => {
    setSelectedEntity(null)
    setModalMode(CrudMode.CREATE)
    setModalOpen(true)
  }, [])

  const handleEdit = useCallback((document: IDocument) => {
    setSelectedEntity(document)
    setModalMode(CrudMode.EDIT)
    setModalOpen(true)
  }, [])

  const handleDeleteClick = useCallback((document: IDocument) => {
    setEntityToDelete(document)
    setDeleteConfirmOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!entityToDelete) return

    try {
      await onRemove(entityToDelete)
      setEntityToDelete(null)
      setDeleteConfirmOpen(false)
    } catch {
      // toast global lo maneja
    }
  }, [entityToDelete, onRemove])

  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelectedEntity(null)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="Documentos" description="Gestiona los documentos del sistema" />
        <PermissionGuard permission="create.document">
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo documento
          </Button>
        </PermissionGuard>
      </div>

      <section>
        <div className="space-y-6">
          <SearchList
            paramsSearch={paramsSearch}
            onSearch={onSearch}
            onReset={onReset}
            placeholder="Buscar documentos..."
          />

          <section>
            {isLoading ? (
              <div>
                <TableLoadingState />
              </div>
            ) : entities.length === 0 ? (
              <div>
                <TableEmptyState />
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Requerido</TableHead>
                        <TableHead>Vigencia</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Fecha de creación</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.map((document) => (
                        <DocumentTableRow
                          key={document.id}
                          entity={document}
                          canEdit={permissions.canEdit}
                          canDelete={permissions.canDelete}
                          isLoading={isLoading}
                          isDeleting={isDeleting}
                          isSaving={isSaving}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {entities.length > 0 && (
                  <Pagination
                    pagination={pagination}
                    onPageChanged={onPageChanged}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </section>

      <DocumentFormModal
        isOpen={modalOpen}
        mode={modalMode}
        entity={selectedEntity ?? undefined}
        onClose={handleModalClose}
        onSuccess={handleModalClose}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen} variant="delete" entityName={entityToDelete?.name}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false)
          setEntityToDelete(null)
        }}
      />
    </div>
  )
}
