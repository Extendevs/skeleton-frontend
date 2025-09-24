import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { 
  EditIcon, 
  TrashIcon, 
  EyeIcon, 
  MoreVerticalIcon,
  PlusIcon,
  PrintIcon,
  RestoreIcon,
  CheckIcon,
  MinusIcon
} from './icons/Icons';

interface ListActionButtonsProps {
  // Display options
  dropdown?: boolean;
  
  // Action flags
  print?: boolean;
  detail?: boolean;
  edit?: boolean;
  remove?: boolean;
  restore?: boolean;
  
  // Selection
  isSelectable?: boolean;
  isSelected?: boolean;
  
  // Event handlers
  onPrint?: () => void;
  onDetail?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
  onRestore?: () => void;
  onSelect?: () => void;
  onDeselect?: () => void;
  
  // Additional content
  children?: React.ReactNode;
}

/**
 * List Action Buttons Component
 * Based on Angular ListActionButtons
 */
export const ListActionButtons = ({
  dropdown = false,
  print = false,
  detail = false,
  edit = true,
  remove = true,
  restore = false,
  isSelectable = false,
  isSelected = false,
  onPrint,
  onDetail,
  onEdit,
  onRemove,
  onRestore,
  onSelect,
  onDeselect,
  children
}: ListActionButtonsProps) => {
  
  const handleSelect = () => {
    if (isSelected) {
      onDeselect?.();
    } else {
      onSelect?.();
    }
  };

  const ActionContent = () => (
    <>
      {!isSelectable && (
        <>
          {print && onPrint && (
            dropdown ? (
              <DropdownMenuItem onClick={onPrint}>
                <PrintIcon className="mr-2 h-4 w-4" />
                Imprimir
              </DropdownMenuItem>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrint}
                className="h-8 px-2 text-gray-600"
                title="Imprimir"
              >
                <PrintIcon className="h-4 w-4" />
                <span className="md:hidden ml-1">Imprimir</span>
              </Button>
            )
          )}
          
          {detail && onDetail && (
            dropdown ? (
              <DropdownMenuItem onClick={onDetail}>
                <EyeIcon className="mr-2 h-4 w-4" />
                Ver más
              </DropdownMenuItem>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDetail}
                className="h-8 px-2 text-blue-600"
                title="Ver más"
              >
                <EyeIcon className="h-4 w-4" />
                <span className="md:hidden ml-1">Ver más</span>
              </Button>
            )
          )}
          
          {edit && onEdit && (
            dropdown ? (
              <DropdownMenuItem onClick={onEdit}>
                <EditIcon className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 px-2 text-primary"
                title="Editar"
              >
                <EditIcon className="h-4 w-4" />
                <span className="md:hidden ml-1">Editar</span>
              </Button>
            )
          )}
          
          {restore && onRestore && (
            dropdown ? (
              <DropdownMenuItem onClick={onRestore} className="text-amber-600">
                <RestoreIcon className="mr-2 h-4 w-4" />
                Restaurar
              </DropdownMenuItem>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRestore}
                className="h-8 px-2 text-amber-600"
                title="Restaurar"
              >
                <RestoreIcon className="h-4 w-4" />
                <span className="md:hidden ml-1">Restaurar</span>
              </Button>
            )
          )}
          
          {remove && onRemove && (
            dropdown ? (
              <DropdownMenuItem onClick={onRemove} className="text-red-600">
                <TrashIcon className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 px-2 text-red-600 hover:bg-red-50"
                title="Eliminar"
              >
                <TrashIcon className="h-4 w-4" />
                <span className="md:hidden ml-1">Eliminar</span>
              </Button>
            )
          )}
        </>
      )}
      
      {isSelectable && (
        dropdown ? (
          <DropdownMenuItem onClick={handleSelect}>
            {isSelected ? (
              <>
                <MinusIcon className="mr-2 h-4 w-4 text-red-600" />
                Deseleccionar
              </>
            ) : (
              <>
                <PlusIcon className="mr-2 h-4 w-4 text-green-600" />
                Seleccionar
              </>
            )}
          </DropdownMenuItem>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelect}
            className={`h-8 px-2 ${isSelected ? 'text-red-600' : 'text-green-600'}`}
            title={isSelected ? 'Deseleccionar' : 'Seleccionar'}
          >
            {isSelected ? (
              <>
                <MinusIcon className="h-4 w-4" />
                <span className="md:hidden ml-1">Deseleccionar</span>
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                <span className="md:hidden ml-1">Seleccionar</span>
              </>
            )}
          </Button>
        )
      )}
      
      {children}
    </>
  );

  if (dropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ActionContent />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <ActionContent />
    </div>
  );
};
