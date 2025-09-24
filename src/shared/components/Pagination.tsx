import { Button } from '../ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  from: number | null;
  to: number | null;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showInfo?: boolean;
  showPageSize?: boolean;
  maxPagesToShow?: number;
}

/**
 * Generic Pagination Component
 * Reusable across all list pages
 */
export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  from,
  to,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showInfo = true,
  showPageSize = true,
  maxPagesToShow = 5
}: PaginationProps) => {
  
  if (totalItems === 0) return null;

  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfWindow = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(1, currentPage - halfWindow);
    let endPage = Math.min(totalPages, currentPage + halfWindow);
    
    // Adjust if we're near the beginning or end
    if (currentPage <= halfWindow) {
      endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage > totalPages - halfWindow) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between py-4">
      {/* Info */}
      {showInfo && (
        <div className="text-sm text-slate-600">
          Showing {from || 0} to {to || 0} of {totalItems} results
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border px-2 py-1 text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0"
            >
              ←
            </Button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                    ...
                  </span>
                );
              }
              
              const pageNum = page as number;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="h-8 min-w-[32px] px-2"
                >
                  {pageNum}
                </Button>
              );
            })}

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
