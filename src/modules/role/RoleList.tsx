import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RoleFormModal } from '@/modules/role/RoleFormModal'
import { RoleTableRow } from '@/modules/role/components/RoleTableRow'
import { useRoleList } from '@/modules/role/hooks/useRoleList'
import type { IRole } from '@/modules/role/schema'
import { useRoleStore } from '@/modules/role/store/roleStore'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Pagination } from '@/shared/components/Pagination'
import { PermissionGuard } from '@/shared/components/PermissionGuard'
import { SearchList } from '@/shared/components/SearchList'
import { PageHeader } from '@/shared/components/atoms/PageHeader'
import { TableEmptyState } from '@/shared/components/molecules/TableEmptyState'
import { TableLoadingState } from '@/shared/components/molecules/TableLoadingState'
import { CrudMode } from '@/shared/enums/CrudMode'
import { useMultiplePermissions } from '@/shared/hooks/usePermissions'
import { useCallback, useState } from 'react'

export const RoleList = () => {
  const { onPageChanged, onRemove, onSearch, onReset, paramsSearch } = useRoleList()
  const { entities, pagination, isLoading, isDeleting, isSaving } = useRoleStore()

  const permissions = useMultiplePermissions({
    canCreate: 'create.role',
    canEdit: 'update.role',
    canDelete: 'delete.role',
    canReport: 'report.role',
    canRestore: 'restore.role',
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<CrudMode>(CrudMode.CREATE)
  const [selectedEntity, setSelectedEntity] = useState<IRole | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [entityToDelete, setEntityToDelete] = useState<IRole | null>(null)

  const handleEdit = useCallback((role: IRole) => {
    setSelectedEntity(role)
    setModalMode(CrudMode.EDIT)
    setModalOpen(true)
  }, [])

  const handleDeleteClick = useCallback((role: IRole) => {
    setEntityToDelete(role)
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
        <PageHeader title="Roles" description="Gestiona los roles del sistema" />
        <PermissionGuard permission="create.role" children={undefined}>
         {/*  <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo rol
          </Button> */}
        </PermissionGuard>
      </div>

      <section>
        <div className="space-y-6">
          <SearchList
            paramsSearch={paramsSearch}
            onSearch={onSearch}
            onReset={onReset}
            placeholder="Buscar roles..."
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
                        <TableHead>Slug</TableHead>
                        <TableHead>Fecha de creación</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.map((role) => (
                        <RoleTableRow
                          key={role.id}
                          entity={role}
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

      <RoleFormModal
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
