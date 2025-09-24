import { memo } from 'react';
import { ICategory } from '../schema';
import { TableRow, TableCell } from '../../../shared/ui';
import { StatusBadge } from '../../../shared/components/atoms/StatusBadge';
import { ColorSwatch } from '../../../shared/components/atoms/ColorSwatch';
import { ActionButtonGroup } from '../../../shared/components/molecules/ActionButtonGroup';

interface CategoryTableRowProps {
  category: ICategory;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  onEdit: (category: ICategory) => void;
  onDelete: (category: ICategory) => void;
}

/**
 * Memoized Category Table Row Component
 * Prevents unnecessary re-renders when other categories change
 */
export const CategoryTableRow = memo<CategoryTableRowProps>(({
  category,
  canEdit,
  canDelete,
  isLoading,
  isDeleting,
  isSaving,
  onEdit,
  onDelete
}) => {
  return (
    <TableRow key={category.id}>
      <TableCell>
        <div className="font-medium text-gray-900">
          {category.name}
        </div>
        {category.description && (
          <div className="text-xs text-gray-500 truncate max-w-xs">
            {category.description}
          </div>
        )}
      </TableCell>
      <TableCell>
        <StatusBadge status={category.status === 'active' ? 'active' : 'inactive'}>
          {category.status === 'active' ? 'Activo' : 'Inactivo'}
        </StatusBadge>
      </TableCell>
      <TableCell>
        <ColorSwatch color={category.color} showLabel={true} />
      </TableCell>
      <TableCell>
        {category.displayOrder}
      </TableCell>
      <TableCell className="text-right">
        <ActionButtonGroup
          onEdit={canEdit ? () => onEdit(category) : undefined}
          edit={canEdit}
          remove={canDelete}
          onRemove={canDelete ? () => onDelete(category) : undefined}
          disabled={isLoading || isDeleting || isSaving}
        />
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimal performance
  return (
    prevProps.category.id === nextProps.category.id &&
    prevProps.category.name === nextProps.category.name &&
    prevProps.category.status === nextProps.category.status &&
    prevProps.category.color === nextProps.category.color &&
    prevProps.category.displayOrder === nextProps.category.displayOrder &&
    prevProps.category.description === nextProps.category.description &&
    prevProps.canEdit === nextProps.canEdit &&
    prevProps.canDelete === nextProps.canDelete &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.isDeleting === nextProps.isDeleting &&
    prevProps.isSaving === nextProps.isSaving
  );
});

CategoryTableRow.displayName = 'CategoryTableRow';
