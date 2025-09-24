import { EmptyStateIcon } from '../atoms/EmptyStateIcon';
import { Button } from '../../ui/button';
import { cn } from '../../utils/cn';

interface TableEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const TableEmptyState = ({
  title = 'No hay datos aún',
  description = 'Intenta ajustar tus filtros o agregar un nuevo registro para comenzar.',
  actionLabel,
  onAction,
  className
}: TableEmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500',
        className
      )}
    >
      <EmptyStateIcon />
      <div className="font-medium text-slate-700">{title}</div>
      {description && <div className="text-xs text-slate-500">{description}</div>}
      {actionLabel && onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-1"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
