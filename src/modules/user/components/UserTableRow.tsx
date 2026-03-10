import { TableCell, TableRow } from '@/components/ui/table'
import type { IRole } from '@/modules/role/schema'
import type { ITenant } from '@/modules/tenant/schema'
import type { IUser } from '@/modules/user/schema'
import { ActionButtonGroup } from '@/shared/components/molecules/ActionButtonGroup'
import { useRoles } from '@/shared/hooks/useRoles'
import { ERoleUserSlug } from '@/shared/interfaces/Entity'
import type { IEntityTableRowProps } from '@/shared/interfaces/list.types'
import { checkMemoListProps } from '@/shared/interfaces/list.types'
import { displayFormatDate } from '@/shared/utils/dateHelper'
import { memo } from 'react'

export const UserTableRow = memo<IEntityTableRowProps<IUser>>(({
  entity,
  canEdit,
  canDelete,
  isLoading,
  isDeleting,
  isSaving,
  onEdit,
  onDelete,
}) => {
  const roles = useRoles()
  const fullName = entity.full_name
    ?? [entity.name, entity.last_name, entity.second_last_name].filter(Boolean).join(' ')

  return (
    <TableRow key={entity.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          {entity.profile_image_url ? (
            <img
              src={entity.profile_image_url}
              alt={fullName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {entity.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="font-medium">{fullName}</div>
        </div>
      </TableCell>
      <TableCell>{entity.email}</TableCell>
      <TableCell>{entity.roles?.map((role: IRole) => role.description).join(', ') ?? '—'}</TableCell>
      {
        roles?.hasRole(ERoleUserSlug.SUPER_ADMIN) ? (
          <>
          <TableCell>{entity.tenants?.length && entity.tenants?.length > 0 ? entity.tenants?.map((tenant: ITenant) => tenant.name).join(', ') : '—'}</TableCell>
          <TableCell>{entity.tenants?.length && entity.tenants?.length > 0 ? entity.tenants?.map((tenant: ITenant) => tenant.subscription_plan?.name + (tenant.subscription_plan?.is_stripe ? ' (Stripe)' : '')).join(', ') : '—'}</TableCell>
          </>
        ) : null
      }
      <TableCell>{entity.phone ?? '—'}</TableCell>
      <TableCell>
        {displayFormatDate(entity.created_at)}
      </TableCell>
      <TableCell className="actions">
        <div className="flex items-center justify-end gap-2">
          <ActionButtonGroup
            dropdown={true}
            onEdit={canEdit ? () => onEdit(entity) : undefined}
            edit={canEdit}
            remove={canDelete}
            onRemove={canDelete ? () => onDelete(entity) : undefined}
            disabled={isLoading || isDeleting || isSaving}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  return checkMemoListProps<IUser>(prevProps, nextProps)
});

UserTableRow.displayName = 'UserTableRow';
