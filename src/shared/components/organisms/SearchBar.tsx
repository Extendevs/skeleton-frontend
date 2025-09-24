import { ReactNode } from 'react';
import { SearchInput } from '../molecules/SearchInput';
import { ISearchParams } from '../../../core/interfaces/list.types';

interface SearchBarProps {
  searchParams?: ISearchParams;
  onSearch?: (params: Record<string, any>) => void;
  onReset?: () => void;
  disabled?: boolean;
  children?: ReactNode; // For additional filters
  className?: string;
}

export const SearchBar = ({
  searchParams,
  onSearch,
  onReset,
  disabled = false,
  children,
  className
}: SearchBarProps) => {
  const handleSearch = (searchValue: string) => {
    const params = {
      ...searchParams,
      search: searchValue ? {
        value: searchValue,
        case_sensitive: false
      } : undefined
    };
    onSearch?.(params);
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <div className={`w-full ${className || ''}`}>
      <div className="flex flex-col gap-3.5">
        {/* Additional filters */}
        {children && (
          <div className="flex flex-col gap-3.5">
            {children}
          </div>
        )}
        
        {/* Search input */}
        <SearchInput
          placeholder="Buscar..."
          onSearch={handleSearch}
          onReset={handleReset}
          disabled={disabled}
          showButtons={true}
        />
      </div>
    </div>
  );
};
