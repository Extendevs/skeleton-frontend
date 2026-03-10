import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UserFormModal } from '@/modules/user/UserFormModal'
import { UserTableRow } from '@/modules/user/components/UserTableRow'
import { useUserList } from '@/modules/user/hooks/useUserList'
import type { IUser } from '@/modules/user/schema'
import { useUserStore } from '@/modules/user/store/userStore'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Pagination } from '@/shared/components/Pagination'
import { PermissionGuard } from '@/shared/components/PermissionGuard'
import { SearchList } from '@/shared/components/SearchList'
import { PageHeader } from '@/shared/components/atoms/PageHeader'
import { TableEmptyState } from '@/shared/components/molecules/TableEmptyState'
import { TableLoadingState } from '@/shared/components/molecules/TableLoadingState'
import { CrudMode } from '@/shared/enums/CrudMode'
import { useMultiplePermissions } from '@/shared/hooks/usePermissions'
import { useRoles } from '@/shared/hooks/useRoles'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import type { DateFilterForm } from '@/shared/interfaces/list.types'
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

export const UserList = () => {
  const { onPageChanged, onRemove, onSearch, onReset, paramsSearch } = useUserList()
  const { entities, pagination, isLoading, isDeleting, isSaving } = useUserStore()
  const roles = useRoles()
  useForm<DateFilterForm>({
    defaultValues: {
      date_start: '',
      date_end: '',
    },
  })

  const permissions = useMultiplePermissions({
    canCreate: 'create.user',
    canEdit: 'update.user',
    canDelete: 'delete.user',
    canReport: 'report.user',
    canRestore: 'restore.user',
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<CrudMode>(CrudMode.CREATE)
  const [selectedEntity, setSelectedEntity] = useState<IUser | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [entityToDelete, setEntityToDelete] = useState<IUser | null>(null)

  const handleCreate = useCallback(() => {
    setSelectedEntity(null)
    setModalMode(CrudMode.CREATE)
    setModalOpen(true)
  }, [])

  const handleEdit = useCallback((user: IUser) => {
    setSelectedEntity(user)
    setModalMode(CrudMode.EDIT)
    setModalOpen(true)
  }, [])

  const handleDeleteClick = useCallback((user: IUser) => {
    setEntityToDelete(user)
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
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <PageHeader title='Usuarios' description='Gestiona los usuarios del sistema' />
        <PermissionGuard permission='create.user'>
          <Button onClick={handleCreate} className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Nuevo usuario
          </Button>
        </PermissionGuard>
      </div>

      <section>
        <div className='space-y-6'>
          <SearchList
            paramsSearch={paramsSearch}
            onSearch={onSearch}
            onReset={onReset}
            placeholder='Buscar usuarios...'
          >
          </SearchList>

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
                        <TableHead>Correo</TableHead>
                        <TableHead>Rol</TableHead>
                        {
                          //CHECK ROLE SUPERADMIN
                          roles?.hasRole(ERoleUserSlug.SUPER_ADMIN) ? (
                            <>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Plan de suscripción</TableHead>
                            </>
                          ) : null
                        }
                        
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Fecha de creación</TableHead>
                        <TableHead className='text-right'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entities.map((user) => (
                        <UserTableRow
                          key={user.id}
                          entity={user}
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

      <UserFormModal
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
