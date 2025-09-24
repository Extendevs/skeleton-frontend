import { ReactNode } from 'react';
import { Button } from '../../ui/button';
import { cn } from '../../utils/cn';
import {
  EditIcon,
  TrashIcon,
  EyeIcon,
  PrintIcon,
  PlusSquareIcon,
  MinusSquareIcon,
} from '../icons/Icons';

/**
 * Props interface matching the Angular component inputs and outputs
 */
export interface ActionButtonGroupProps {
  // Input properties (similar to Angular inputs)
  isSelectable?: boolean;
  isSelected?: boolean;
  edit?: boolean;
  mobile?: boolean;
  print?: boolean;
  detail?: boolean;
  dropdown?: boolean;
  remove?: boolean;
  restore?: boolean;
  
  // Event handlers (similar to Angular outputs)
  onEdit?: () => void;
  onDetail?: () => void;
  onPrint?: () => void;
  onRestore?: () => void;
  onRemove?: () => void;
  onSelect?: () => void;
  
  // Additional props for React
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * ActionButtonGroup Component
 * 
 * Estandarizado basado en el componente Angular ListActionsButtonsComponent.
 * Proporciona botones de acción para operaciones CRUD y selección.
 * 
 * Funcionalidades:
 * - Modo seleccionable con estados seleccionado/no seleccionado
 * - Acciones CRUD: ver, editar, eliminar, restaurar
 * - Acción de impresión
 * - Soporte para modo dropdown (comentado como en Angular)
 * - Diseño responsivo
 * - Prevención de propagación de eventos
 */
export const ActionButtonGroup = ({
  isSelectable = false,
  isSelected = false,
  edit = false,
  print = false,
  detail = false,
  dropdown = false,
  remove = false,
  onEdit,
  onDetail,
  onPrint,
  onRemove,
  onSelect,
  children,
  className,
  disabled = false
}: ActionButtonGroupProps) => {
  
  /**
   * Handle edit action with event prevention (like Angular)
   */
  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onEdit?.();
  };

  /**
   * Handle select action with event prevention (like Angular)
   */
  const handleSelect = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    onSelect?.();
  };

  /**
   * Handle other actions with event prevention
   */
  const handleAction = (event: React.MouseEvent, action?: () => void) => {
    event.stopPropagation();
    event.preventDefault();
    action?.();
  };

  /**
   * Options template (equivalent to Angular's ng-template #optionsTemplate)
   */
  const OptionsTemplate = () => (
    <div className="flex items-center gap-1">
      {/* Non-selectable actions */}
      {!isSelectable && (
        <>
          {/* Print button */}
          {print && onPrint && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAction(e, onPrint)}
              title="Imprimir"
              disabled={disabled}
              className={cn(
                "h-8 w-8 p-0 text-gray-600 hover:text-gray-700",
                "text-3xl md:text-2xl" // Similar to Angular's text sizing
              )}
            >
              <PrintIcon className="h-6 w-6 md:h-5 md:w-5" />
              {dropdown && <span className="ml-1">Imprimir</span>}
            </Button>
          )}

          {/* Detail/View button */}
          {detail && onDetail && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAction(e, onDetail)}
              title="Ver más"
              disabled={disabled}
              className={cn(
                "h-8 w-8 p-0 text-blue-600 hover:text-blue-700",
                "text-3xl md:text-2xl"
              )}
            >
              <EyeIcon className="h-6 w-6 md:h-5 md:w-5" />
              <span className="md:hidden block ml-1">Ver más</span>
            </Button>
          )}

          {/* Edit button */}
          {edit && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              title="Editar"
              disabled={disabled}
              className={cn(
                "h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50",
                "text-3xl md:text-2xl"
              )}
            >
              <EditIcon className="h-6 w-6 md:h-5 md:w-5" />
              <span className="md:hidden block ml-1">Editar</span>
            </Button>
          )}

          {/* Restore button (commented like in Angular) */}
          {/* {restore && onRestore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAction(e, onRestore)}
              title="Restaurar"
              disabled={disabled}
              className={cn(
                "h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50",
                "text-3xl md:text-2xl"
              )}
            >
              <RestoreIcon className="h-6 w-6 md:h-5 md:w-5" />
            </Button>
          )} */}

          {/* Remove/Delete button */}
          {remove && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleAction(e, onRemove)}
              title="Eliminar"
              disabled={disabled}
              className={cn(
                "h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50",
                "text-3xl md:text-2xl"
              )}
            >
              <TrashIcon className="h-6 w-6 md:h-5 md:w-5" />
              <span className="md:hidden block ml-1">Eliminar</span>
            </Button>
          )}
        </>
      )}

      {/* Selectable actions */}
      {isSelectable && !isSelected && onSelect && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelect}
          title="Seleccionar"
          disabled={disabled}
          className={cn(
            "h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50",
            "text-3xl md:text-4xl"
          )}
        >
          <PlusSquareIcon className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
          <span className="md:hidden block ml-1">Seleccionar</span>
        </Button>
      )}

      {isSelectable && isSelected && onSelect && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelect}
          title="Deseleccionar"
          disabled={disabled}
          className={cn(
            "h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50",
            "text-3xl md:text-4xl"
          )}
        >
          <MinusSquareIcon className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
          <span className="md:hidden block ml-1">Deseleccionar</span>
        </Button>
      )}

      {/* Children content (equivalent to ng-content) */}
      {children}

      {/* Spacer (equivalent to Angular's span with height) */}
      <span className="block h-[36px]" />
    </div>
  );

  // Dropdown variant (commented like in Angular)
  if (dropdown) {
    // TODO: Implement dropdown version similar to Angular
    // Currently commented out like in the original Angular component
    /*
    return (
      <div className="w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-950"
              disabled={disabled}
            >
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <OptionsTemplate />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
    */
    return <OptionsTemplate />;
  }

  // Inline variant (default)
  return (
    <div className={cn('flex items-center', className)}>
      <OptionsTemplate />
    </div>
  );
};

// Default export for consistency
export default ActionButtonGroup;