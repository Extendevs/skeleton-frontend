import { useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { SearchIcon, XIcon } from '../components/icons/Icons';
import { ISearchParams } from '../../core/interfaces/list.types';

interface SearchListProps {
  paramsSearch?: ISearchParams;
  filters?: Record<string, any>;
  showSearchBar?: boolean;
  searchAction?: boolean;
  disabled?: boolean;
  placeholder?: string;
  children?: ReactNode;
  fieldsetChildren?: ReactNode;
  onSearch: (params: ISearchParams) => void;
  onReset: (data: { paramsSearch: ISearchParams; filters: Record<string, any> }) => void;
}

interface SearchFormData {
  search: string;
}

export const SearchList = ({
  paramsSearch = {},
  filters = {},
  showSearchBar = true,
  searchAction = true,
  disabled = false,
  placeholder = 'Search...',
  children,
  fieldsetChildren,
  onSearch,
  onReset
}: SearchListProps) => {
  const [isSearchable, setIsSearchable] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, setValue, watch, reset } = useForm<SearchFormData>({
    defaultValues: {
      search: ''
    }
  });

  const searchValue = watch('search');

  // Watch for changes in search input
  useEffect(() => {
    if (searchValue !== '') {
      setIsSearchable(true);
    }
  }, [searchValue]);

  const dispatchSearch = useCallback(() => {
    const searchParams: ISearchParams = {
      ...paramsSearch,
      search: searchValue ? {
        value: searchValue,
        case_sensitive: false
      } : null
    };

    onSearch(searchParams);
  }, [paramsSearch, searchValue, onSearch]);

  const handleSearch = useCallback(() => {
    if (!isSearchable && !searchValue) {
      return;
    }

    dispatchSearch();
    setIsSearchable(false);
  }, [isSearchable, searchValue, dispatchSearch]);

  const handleReset = useCallback(() => {
    // Reset form
    reset({ search: '' });
    
    // Reset search params
    const resetParams: ISearchParams = {
      ...paramsSearch,
      search: null
    };

    // Reset filters - clear all form controls in the form
    const resetFilters = { ...filters };
    if (formRef.current) {
      const inputs = formRef.current.querySelectorAll('input, select, textarea, [name]');
      inputs.forEach((input) => {
        const element = input as HTMLInputElement;
        const name = element.getAttribute('name');
        
        if (name && name !== 'search') {
          // Remove filter from search params
          if (resetParams.filters) {
            resetParams.filters = resetParams.filters.filter(item => item.field !== name);
          }
          
          // Reset filter value
          if (resetFilters[name]) {
            if (!resetFilters[name].operator) {
              // Complex filter - iterate properties
              for (const key in resetFilters[name]) {
                if (Object.prototype.hasOwnProperty.call(resetFilters[name], key)) {
                  resetFilters[name][key] = {
                    ...resetFilters[name][key],
                    value: null
                  };
                }
              }
            } else {
              // Simple filter
              resetFilters[name] = {
                ...resetFilters[name],
                value: null
              };
            }
          }
        }
      });
    }

    setIsSearchable(false);
    onReset({
      paramsSearch: resetParams,
      filters: resetFilters
    });
  }, [paramsSearch, filters, reset, onReset]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit(handleSearch)}
      autoComplete="off" 
      id="searchForm" 
      className="w-full"
    >
      <fieldset disabled={disabled} className="border-0 p-0 m-0">
        <div className="flex flex-col gap-3.5">
          <div className="w-full">
            <div className="flex flex-col gap-3.5">
              {/* Content slot - filters, etc. */}
              {children}
              
              {/* Search bar */}
              {showSearchBar && (
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Input
                      {...register('search')}
                      placeholder={placeholder}
                      onKeyDown={handleKeyDown}
                      className="pr-10"
                    />
                    <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  
                  {searchAction && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="px-3"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        type="submit"
                        className="px-4 flex items-center gap-2"
                      >
                        <SearchIcon className="h-4 w-4" />
                        <span className="hidden md:block">Search</span>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Fieldset content slot - additional form controls */}
          {fieldsetChildren}
        </div>
      </fieldset>
    </form>
  );
};
