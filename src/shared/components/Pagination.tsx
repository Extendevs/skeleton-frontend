import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { IPagination } from '@/shared/interfaces/list.types'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  pagination: IPagination
  onPageChanged: (_page: number, _size?: number) => void
  pageSizeOptions?: number[]
  selectedCount?: number
}

export const Pagination = ({
  pagination,
  onPageChanged,
  pageSizeOptions = [20, 50, 100],
  selectedCount,
}: PaginationProps) => {
  const { page: currentPage, pages: totalPages, total: totalItems, per_page: pageSize } = pagination

  if (totalItems === 0 || totalPages <= 1) return null

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t px-2 py-4 sticky bottom-0 bg-background z-10">
      <div className="text-sm text-muted-foreground">
        {selectedCount !== undefined
          ? `${selectedCount} de ${totalItems} fila(s) seleccionada(s).`
          : `${totalItems} fila(s) en total.`}
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">Filas por página</p>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageChanged(1, Number(value))}
          >
            <SelectTrigger size="sm" className="w-[70px]">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChanged(1)}
              disabled={currentPage <= 1}
              aria-label="Primera página"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChanged(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChanged(currentPage + 1)}
              disabled={currentPage >= totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChanged(totalPages)}
              disabled={currentPage >= totalPages}
              aria-label="Última página"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
