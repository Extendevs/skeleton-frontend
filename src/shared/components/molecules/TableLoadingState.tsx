import { LoadingSpinner } from '../atoms/LoadingSpinner';
import { cn } from '../../utils/cn';

interface TableLoadingStateProps {
  message?: string;
  rows?: number;
  className?: string;
}

export const TableLoadingState = ({
  message = 'Cargando datos...',
  rows = 3,
  className
}: TableLoadingStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-sm text-slate-500',
        className
      )}
    >
      <LoadingSpinner size="lg" className="text-blue-500" />
      <div className="font-medium text-slate-700">{message}</div>
      <div className="text-xs text-slate-500">
        Por favor espera mientras se cargan los datos...
      </div>
    </div>
  );
};
