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
}: TableEmptyStateProps): JSX.Element => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500 ${
        className ?? ''
      }`}
    >
      <svg
        className="h-8 w-8 text-slate-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="14" rx="2" />
        <path d="M3 9h18" />
        <path d="M7 15h2" />
      </svg>
      <div className="font-medium text-slate-700">{title}</div>
      {description && <div className="text-xs text-slate-500">{description}</div>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
