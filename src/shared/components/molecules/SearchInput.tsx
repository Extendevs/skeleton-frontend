import { useState } from 'react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { cn } from '../../utils/cn';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch?: (value: string) => void;
  onReset?: () => void;
  disabled?: boolean;
  className?: string;
  showButtons?: boolean;
}

export const SearchInput = ({
  placeholder = 'Buscar...',
  value: controlledValue,
  onSearch,
  onReset,
  disabled = false,
  className,
  showButtons = true
}: SearchInputProps) => {
  const [internalValue, setInternalValue] = useState('');
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
  };

  const handleSearch = () => {
    onSearch?.(value);
  };

  const handleReset = () => {
    if (controlledValue === undefined) {
      setInternalValue('');
    }
    onReset?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex-grow relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="pr-8"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {showButtons && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={disabled}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            ✕
          </Button>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={disabled}
          >
            🔍
            <span className="hidden md:inline ml-1">Buscar</span>
          </Button>
        </>
      )}
    </div>
  );
};
