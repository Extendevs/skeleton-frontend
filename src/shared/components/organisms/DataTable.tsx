import { ReactNode } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead } from '../../ui/table';
import { TableLoadingState } from '../molecules/TableLoadingState';
import { TableEmptyState } from '../molecules/TableEmptyState';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  empty?: {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  keyExtractor: (record: T) => string | number;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  empty,
  keyExtractor,
  className
}: DataTableProps<T>) {
  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="p-4">
          <TableLoadingState />
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="p-4">
          <TableEmptyState {...empty} />
        </div>
      );
    }

    return (
      <TableBody>
        {data.map((record, index) => (
          <TableRow key={keyExtractor(record)}>
            {columns.map((column) => {
              const value = typeof column.key === 'string' && column.key.includes('.') 
                ? column.key.split('.').reduce((obj, key) => obj?.[key], record as any)
                : (record as any)[column.key];
              
              return (
                <td
                  key={String(column.key)}
                  className={`px-3 py-2 text-${column.align || 'left'}`}
                  style={{ width: column.width }}
                >
                  {column.render ? column.render(value, record, index) : value}
                </td>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    );
  };

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={`text-${column.align || 'left'}`}
                style={{ width: column.width }}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {renderTableContent()}
      </Table>
    </div>
  );
}
