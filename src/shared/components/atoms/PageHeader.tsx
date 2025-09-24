interface PageHeaderProps {
  title: string;
  total: number;
  selectedCount?: number;
  isEmpty?: boolean;
  isLoading?: boolean;
}

export const PageHeader = ({ 
  title, 
  total, 
  selectedCount = 0, 
  isEmpty = false, 
  isLoading = false 
}: PageHeaderProps) => (
  <div>
    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
      <span>Total: {total}</span>
      {selectedCount > 0 && (
        <span className="font-medium text-blue-600">{selectedCount} selected</span>
      )}
      {isEmpty && !isLoading && (
        <span className="text-amber-600">No results found</span>
      )}
    </div>
  </div>
);
