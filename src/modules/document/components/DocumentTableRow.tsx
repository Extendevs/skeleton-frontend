import { TableCell, TableRow } from '@/components/ui/table'
import type { IDocument } from '@/modules/document/schema'
import { ActionButtonGroup } from '@/shared/components/molecules/ActionButtonGroup'
import type { IEntityTableRowProps } from '@/shared/interfaces/list.types'
import { checkMemoListProps } from '@/shared/interfaces/list.types'
import { displayFormatDate } from '@/shared/utils/dateHelper'
import { memo } from 'react'

export const DocumentTableRow = memo<IEntityTableRowProps<IDocument>>(({
  entity,
  canEdit,
  canDelete,
  isLoading,
  isDeleting,
  isSaving,
  onEdit,
  onDelete,
}) => {
  return (
    <TableRow key={entity.id}>
      <TableCell>
        <div className="font-medium">
          {entity.name}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {entity.description || '—'}
      </TableCell>
      <TableCell>
        {entity.required ? 'Si' : 'No'}
      </TableCell>
      <TableCell>
        {entity.vigency ? 'Si' : 'No'}
      </TableCell>
      <TableCell>
        {entity.type?.name || '—'}
      </TableCell>
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
  )
}, (prevProps, nextProps) => checkMemoListProps<IDocument>(prevProps, nextProps))

DocumentTableRow.displayName = 'DocumentTableRow'
