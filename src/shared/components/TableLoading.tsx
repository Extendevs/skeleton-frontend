interface TableLoadingProps {
  message?: string;
  description?: string;
  className?: string;
}

export const TableLoading = ({
  message = 'Cargando registros…',
  description = 'Esto solo tomará un momento.',
  className
}: TableLoadingProps): JSX.Element => {
  return (
    <div
      className={`min-h-[134px] flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500 ${
        className ?? ''
      }`}
    >
      <span className="relative h-4 w-4">
        <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-slate-400/60"></span>
        <span className="relative inline-flex h-4 w-4 rounded-full bg-slate-500"></span>
      </span>
      <div className='text-center'>
        <div className="font-medium text-slate-700">{message}</div>
        {description && <div className="text-xs text-slate-500">{description}</div>}
      </div>
    </div>
  );
};
