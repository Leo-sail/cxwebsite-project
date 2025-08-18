/**
 * SearchInput 搜索输入框组件
 */
import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils';

/**
 * SearchInput 组件属性
 */
export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * SearchInput 组件
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = '搜索...',
  value,
  onChange,
  onSearch,
  className,
  disabled = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value || '');
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg',
          'placeholder-gray-500 text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-colors duration-200',
          disabled && 'bg-gray-50 cursor-not-allowed',
          'hover:border-gray-400'
        )}
      />
    </div>
  );
};

export default SearchInput;