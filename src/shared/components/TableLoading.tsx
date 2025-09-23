interface TableLoadingProps {
  message?: string;
  description?: string;
  className?: string;
}

export const TableLoading = ({
  message = 'Loading records…',
  description = 'This should only take a moment.',
  className
}: TableLoadingProps): JSX.Element => {
  return (
    <div
      className={`flex items-center gap-3 rounded-md border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm ${
        className ?? ''
      }`}
    >
      <span className="relative h-4 w-4">
        <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-slate-400/60"></span>
        <span className="relative inline-flex h-4 w-4 rounded-full bg-slate-500"></span>
      </span>
      <div>
        <div className="font-medium text-slate-700">{message}</div>
        {description && <div className="text-xs text-slate-500">{description}</div>}
      </div>
    </div>
  );
};
