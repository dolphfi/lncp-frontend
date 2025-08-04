import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Option {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string | number;
  onValueChange: (value: string | number | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
  renderOption?: (option: Option) => React.ReactNode;
  renderValue?: (option: Option) => React.ReactNode;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner une option...",
  searchPlaceholder = "Rechercher...",
  emptyText = "Aucune option trouvée",
  disabled = false,
  loading = false,
  clearable = false,
  className,
  onSearch,
  renderOption,
  renderValue
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);

  // Filter options based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOptions(options);
      return;
    }

    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchQuery, options]);

  // Handle external search
  useEffect(() => {
    if (onSearch && searchQuery) {
      const debounceTimer = setTimeout(() => {
        onSearch(searchQuery);
      }, 300);

      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, onSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
      }
    }
  };

  const handleOptionSelect = (option: Option) => {
    if (!option.disabled) {
      onValueChange(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(undefined);
  };

  const defaultRenderOption = (option: Option) => (
    <div className="flex flex-col">
      <span className="font-medium">{option.label}</span>
      {option.description && (
        <span className="text-sm text-gray-500">{option.description}</span>
      )}
    </div>
  );

  const defaultRenderValue = (option: Option) => option.label;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
          disabled && "cursor-not-allowed bg-gray-50 text-gray-500",
          isOpen && "border-indigo-500 ring-1 ring-indigo-500"
        )}
      >
        <span className="block truncate">
          {selectedOption ? (
            renderValue ? renderValue(selectedOption) : defaultRenderValue(selectedOption)
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="pointer-events-auto mr-1 rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-3 w-3 text-gray-400" />
            </button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* Search Input */}
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-auto">
            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span>Chargement...</span>
                </div>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  disabled={option.disabled}
                  className={cn(
                    "relative w-full cursor-default select-none py-2 pl-3 pr-9 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                    option.disabled && "cursor-not-allowed opacity-50",
                    selectedOption?.value === option.value && "bg-indigo-50 text-indigo-900"
                  )}
                >
                  <div className="flex items-center">
                    <span className="block truncate">
                      {renderOption ? renderOption(option) : defaultRenderOption(option)}
                    </span>
                  </div>

                  {selectedOption?.value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour sélection multiple
interface MultiSelectProps extends Omit<SearchableSelectProps, 'value' | 'onValueChange'> {
  values: (string | number)[];
  onValuesChange: (values: (string | number)[]) => void;
  maxSelections?: number;
}

export const MultiSearchableSelect: React.FC<MultiSelectProps> = ({
  options,
  values,
  onValuesChange,
  maxSelections,
  placeholder = "Sélectionner des options...",
  ...props
}) => {
  const selectedOptions = options.filter(option => values.includes(option.value));

  const handleOptionToggle = (option: Option) => {
    if (values.includes(option.value)) {
      // Remove from selection
      onValuesChange(values.filter(v => v !== option.value));
    } else {
      // Add to selection (if not at max)
      if (!maxSelections || values.length < maxSelections) {
        onValuesChange([...values, option.value]);
      }
    }
  };

  const handleClearAll = () => {
    onValuesChange([]);
  };

  const renderValue = () => {
    if (selectedOptions.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>;
    }
    
    if (selectedOptions.length === 1) {
      return selectedOptions[0].label;
    }
    
    return `${selectedOptions.length} sélectionnés`;
  };

  return (
    <div className="relative">
      <SearchableSelect
        {...props}
        options={options}
        value={undefined}
        onValueChange={() => {}} // Not used in multi-select
        placeholder={placeholder}
        clearable={values.length > 0}
        renderValue={() => renderValue()}
        renderOption={(option) => (
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              {option.description && (
                <span className="text-sm text-gray-500">{option.description}</span>
              )}
            </div>
            {values.includes(option.value) && (
              <Check className="h-4 w-4 text-indigo-600" />
            )}
          </div>
        )}
      />
      
      {/* Selected items display */}
      {selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {option.label}
              <button
                type="button"
                onClick={() => handleOptionToggle(option)}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedOptions.length > 1 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              Tout effacer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
