import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { EditIcon, TrashIcon, EyeIcon, MoreVerticalIcon } from './icons/Icons';

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  variant?: 'dropdown' | 'inline';
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

/**
 * Generic Action Buttons Component
 * Can be used as dropdown or inline buttons
 */
export const ActionButtons = ({
  onView,
  onEdit,
  onDelete,
  variant = 'inline',
  showView = false,
  showEdit = true,
  showDelete = true
}: ActionButtonsProps) => {
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showView && onView && (
            <DropdownMenuItem onClick={onView}>
              <EyeIcon className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
          )}
          {showEdit && onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <EditIcon className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {showDelete && onDelete && (
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Inline buttons
  return (
    <div className="flex items-center gap-1">
      {showView && onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onView}
          className="h-8 w-8 p-0"
          title="View"
        >
          <EyeIcon />
        </Button>
      )}
      {showEdit && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0"
          title="Editar"
        >
          <EditIcon />
        </Button>
      )}
      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Eliminar"
        >
          <TrashIcon />
        </Button>
      )}
    </div>
  );
};
