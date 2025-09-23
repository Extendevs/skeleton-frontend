import { useMemo, PropsWithChildren } from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { cn } from '../utils/cn';

interface ListActionsProps extends PropsWithChildren {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  searchDisabled?: boolean;
  showSearch?: boolean;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDetail?: boolean;
  allowPrint?: boolean;
  allowRemove?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  dropdown?: boolean;
  createLabel?: string;
  createTitle?: string;
  className?: string;
  onCreate?: () => void;
  onEdit?: () => void;
  onDetail?: () => void;
  onPrint?: () => void;
  onRemove?: () => void;
  onSelect?: () => void;
}

type ActionVariant = 'primary' | 'info' | 'success' | 'danger' | 'secondary';

type ActionDescriptor = {
  key: string;
  label: string;
  title?: string;
  variant: ActionVariant;
  onClick: () => void;
};

export const ListActions = ({
  searchValue = '',
  onSearchChange,
  placeholder = 'Search…',
  searchDisabled = false,
  showSearch = true,
  allowCreate = false,
  allowEdit = false,
  allowDetail = false,
  allowPrint = false,
  allowRemove = false,
  isSelectable = false,
  isSelected = false,
  dropdown = false,
  createLabel = 'Create',
  createTitle,
  className,
  onCreate,
  onEdit,
  onDetail,
  onPrint,
  onRemove,
  onSelect,
  children
}: ListActionsProps): JSX.Element => {
  // No longer need state management for dropdown - handled by Radix UI

  const actions = useMemo<ActionDescriptor[]>(() => {
    const items: ActionDescriptor[] = [];

    if (allowPrint && onPrint) {
      items.push({
        key: 'print',
        label: 'Imprimir',
        title: 'Imprimir',
        variant: 'secondary',
        onClick: onPrint
      });
    }

    if (allowDetail && onDetail) {
      items.push({
        key: 'detail',
        label: 'Ver más',
        title: 'Ver más',
        variant: 'info',
        onClick: onDetail
      });
    }

    if (allowEdit && onEdit) {
      items.push({
        key: 'edit',
        label: 'Editar',
        title: 'Editar',
        variant: 'primary',
        onClick: onEdit
      });
    }

    if (allowRemove && onRemove) {
      items.push({
        key: 'remove',
        label: 'Eliminar',
        title: 'Eliminar',
        variant: 'danger',
        onClick: onRemove
      });
    }

    if (isSelectable && onSelect) {
      items.push({
        key: 'select',
        label: isSelected ? 'Deseleccionar' : 'Seleccionar',
        title: isSelected ? 'Deseleccionar' : 'Seleccionar',
        variant: isSelected ? 'danger' : 'success',
        onClick: onSelect
      });
    }

    if (allowCreate && onCreate) {
      items.push({
        key: 'create',
        label: createLabel,
        title: createTitle ?? createLabel,
        variant: 'primary',
        onClick: onCreate
      });
    }

    return items;
  }, [
    allowCreate,
    allowDetail,
    allowEdit,
    allowPrint,
    allowRemove,
    createLabel,
    createTitle,
    isSelectable,
    isSelected,
    onCreate,
    onDetail,
    onEdit,
    onPrint,
    onRemove,
    onSelect
  ]);

  const getButtonVariant = (variant: ActionVariant): 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'danger':
        return 'destructive';
      case 'success':
        return 'outline'; // with custom success styling
      case 'info':
      case 'secondary':
      default:
        return 'outline';
    }
  };

  const getButtonClassName = (variant: ActionVariant) => {
    switch (variant) {
      case 'success':
        return 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700';
      default:
        return undefined;
    }
  };

  const handleAction = (action: ActionDescriptor) => {
    action.onClick();
  };

  const renderInlineActions = () => {
    if (actions.length === 0 && !children) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.key}
            type="button"
            variant={getButtonVariant(action.variant)}
            className={getButtonClassName(action.variant)}
            title={action.title}
            onClick={() => handleAction(action)}
          >
            {action.label}
          </Button>
        ))}
        {children}
      </div>
    );
  };

  const renderDropdownActions = () => {
    if (actions.length === 0 && !children) {
      return null;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Acciones</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.key}
              onClick={() => handleAction(action)}
              className={cn(
                action.variant === 'danger' && 'text-rose-600 focus:text-rose-600',
                action.variant === 'success' && 'text-emerald-600 focus:text-emerald-600'
              )}
            >
              {action.label}
            </DropdownMenuItem>
          ))}
          {children && <div className="p-1">{children}</div>}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {showSearch && (
        <Input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder={placeholder}
          disabled={searchDisabled}
          className="w-56"
        />
      )}
      {dropdown ? renderDropdownActions() : renderInlineActions()}
    </div>
  );
};
