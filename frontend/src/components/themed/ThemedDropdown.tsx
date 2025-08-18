import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useComponentStyles } from '../../hooks/useTheme';
import { StyleMerger } from '../../utils/themeUtils';
import { defaultDropdownStyles } from './dropdown.utils';

/**
 * Dropdown选项接口
 */
export interface DropdownOption {
  /** 选项值 */
  value: string | number;
  /** 选项标签 */
  label: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选项图标 */
  icon?: React.ReactNode;
  /** 选项描述 */
  description?: string;
  /** 分组标识 */
  group?: string;
}

/**
 * Dropdown组件的属性接口
 */
export interface ThemedDropdownProps {
  /** 下拉选项 */
  options: DropdownOption[];
  /** 当前选中值 */
  value?: string | number | (string | number)[];
  /** 选择变化回调 */
  onChange?: (value: string | number | (string | number)[]) => void;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否可搜索 */
  searchable?: boolean;
  /** 搜索占位符 */
  searchPlaceholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 是否必填 */
  required?: boolean;
  /** Dropdown变体 */
  variant?: 'default' | 'filled' | 'outline' | 'underline' | 'ghost';
  /** Dropdown尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Dropdown状态 */
  state?: 'default' | 'error' | 'warning' | 'success';
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  helperText?: string;
  /** 标签 */
  label?: string;
  /** 是否显示清除按钮 */
  clearable?: boolean;
  /** 是否显示全选按钮(多选时) */
  showSelectAll?: boolean;
  /** 全选文本 */
  selectAllText?: string;
  /** 最大显示选项数 */
  maxDisplayOptions?: number;
  /** 下拉框最大高度 */
  maxHeight?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 是否加载中 */
  loading?: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 无选项文本 */
  noOptionsText?: string;
  /** 自定义渲染选项 */
  renderOption?: (option: DropdownOption, isSelected: boolean) => React.ReactNode;
  /** 自定义渲染选中值 */
  renderValue?: (value: string | number | (string | number)[]) => React.ReactNode;
  /** 下拉框位置 */
  placement?: 'bottom' | 'top' | 'auto';
}

/**
 * 主题化Dropdown组件
 * 支持单选、多选、搜索、分组等功能
 */
export const ThemedDropdown: React.FC<ThemedDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择',
  multiple = false,
  searchable = false,
  searchPlaceholder = '搜索选项',
  disabled = false,
  readOnly = false,
  required = false,
  variant = 'default',
  size = 'md',
  state = 'default',
  error,
  helperText,
  label,
  clearable = false,
  showSelectAll = false,
  selectAllText = '全选',
  maxDisplayOptions = 100,
  maxHeight = 200,
  className = '',
  style = {},
  leftIcon,
  rightIcon,
  loading = false,
  loadingText = '加载中...',
  noOptionsText = '暂无选项',
  renderOption,
  renderValue
}) => {
  const { getComponentStyles } = useComponentStyles('dropdown');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 处理选项选择
  const handleOptionSelect = useCallback((option: DropdownOption) => {
    if (option.disabled) return;

    let newValue: string | number | (string | number)[];
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(option.value)) {
        newValue = currentValues.filter(v => v !== option.value);
      } else {
        newValue = [...currentValues, option.value];
      }
    } else {
      newValue = option.value;
      setIsOpen(false);
    }

    onChange?.(newValue);
  }, [multiple, value, onChange]);

  // 获取组件样式
  const componentStyles = getComponentStyles() as Record<string, unknown>;
  const baseStyles = (componentStyles?.base as Record<string, unknown>) || {};
  const triggerStyles = (componentStyles?.trigger as Record<string, unknown>) || {};
  const listStyles = (componentStyles?.list as Record<string, unknown>) || {};
  const optionStyles = (componentStyles?.option as Record<string, unknown>) || {};

  // 过滤选项
  const filteredOptions = options.filter(option => {
    if (!searchable || !searchTerm) return true;
    return option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
           option.value.toString().toLowerCase().includes(searchTerm.toLowerCase());
  }).slice(0, maxDisplayOptions);

  // 分组选项
  const groupedOptions = filteredOptions.reduce((groups, option) => {
    const group = option.group || 'default';
    if (!groups[group]) groups[group] = [];
    groups[group].push(option);
    return groups;
  }, {} as Record<string, DropdownOption[]>);

  // 获取选中的选项（用于内部逻辑）
  // const selectedOptions = options.filter(option => {
  //   if (multiple && Array.isArray(value)) {
  //     return value.includes(option.value);
  //   }
  //   return option.value === value;
  // });

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理键盘导航
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions, handleOptionSelect]);



  // 处理全选
  const handleSelectAll = () => {
    if (!multiple) return;

    const allValues = filteredOptions
      .filter(option => !option.disabled)
      .map(option => option.value);
    
    const currentValue = Array.isArray(value) ? value : [];
    const isAllSelected = allValues.every(val => currentValue.includes(val));

    if (isAllSelected) {
      // 取消全选
      const newValue = currentValue.filter(val => !allValues.includes(val));
      onChange?.(newValue);
    } else {
      // 全选
      const newValue = [...new Set([...currentValue, ...allValues])];
      onChange?.(newValue);
    }
  };

  // 处理清除
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) {
      onChange(multiple ? [] : '');
    }
  };

  // 渲染选中值
  const renderSelectedValue = () => {
    if (renderValue) {
      return renderValue(value || (multiple ? [] : ''));
    }

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option?.label || value[0];
      }
      return `已选择 ${value.length} 项`;
    }

    if (value !== undefined && value !== '') {
      const option = options.find(opt => opt.value === value);
      return option?.label || value;
    }

    return placeholder;
  };

  // 渲染选项
  const renderOptionItem = (option: DropdownOption, index: number) => {
    const isSelected = multiple && Array.isArray(value) 
      ? value.includes(option.value)
      : option.value === value;
    const isHighlighted = index === highlightedIndex;

    if (renderOption) {
      return renderOption(option, isSelected);
    }

    return (
      <li
        key={option.value}
        className={StyleMerger.mergeClassNames(
          'dropdown-option',
          isSelected ? 'dropdown-option--selected' : '',
          isHighlighted ? 'dropdown-option--highlighted' : '',
          option.disabled ? 'dropdown-option--disabled' : ''
        )}
        style={optionStyles as React.CSSProperties}
        onClick={() => handleOptionSelect(option)}
        onMouseEnter={() => setHighlightedIndex(index)}
      >
        {multiple && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="dropdown-option__checkbox"
          />
        )}
        {option.icon && (
          <span className="dropdown-option__icon">{option.icon}</span>
        )}
        <div className="dropdown-option__content">
          <span className="dropdown-option__label">{option.label}</span>
          {option.description && (
            <span className="dropdown-option__description">{option.description}</span>
          )}
        </div>
      </li>
    );
  };

  // 合并样式
  const dropdownClassName = StyleMerger.mergeClassNames(
    'dropdown',
    `dropdown--${variant}`,
    `dropdown--${size}`,
    `dropdown--${state}`,
    isOpen ? 'dropdown--open' : '',
    disabled ? 'dropdown--disabled' : '',
    readOnly ? 'dropdown--readonly' : '',
    required ? 'dropdown--required' : '',
    className
  );

  const triggerClassName = StyleMerger.mergeClassNames(
    'dropdown-trigger',
    `dropdown-trigger--${variant}`,
    `dropdown-trigger--${size}`,
    `dropdown-trigger--${state}`,
    isOpen ? 'dropdown-trigger--open' : ''
  );

  return (
    <div className={dropdownClassName} style={{ ...defaultDropdownStyles.base, ...(baseStyles as React.CSSProperties), ...style }} ref={dropdownRef}>
      {/* 标签 */}
      {label && (
        <label className="dropdown-label">
          {label}
          {required && <span className="dropdown-required">*</span>}
        </label>
      )}

      {/* 触发器 */}
      <div
        className={triggerClassName}
        style={triggerStyles as React.CSSProperties}
        onClick={() => !disabled && !readOnly && setIsOpen(!isOpen)}
      >
        {leftIcon && (
          <span className="dropdown-trigger__left-icon">{leftIcon}</span>
        )}
        
        <div className="dropdown-trigger__content">
          {searchable && isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="dropdown-search"
              autoFocus
            />
          ) : (
            <span className="dropdown-trigger__value">
              {renderSelectedValue()}
            </span>
          )}
        </div>

        <div className="dropdown-trigger__icons">
          {loading && (
            <span className="dropdown-trigger__loading">⟳</span>
          )}
          {clearable && (value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) && (
            <button
              type="button"
              className="dropdown-trigger__clear"
              onClick={handleClear}
            >
              ×
            </button>
          )}
          {rightIcon || (
            <span className={`dropdown-trigger__arrow ${isOpen ? 'dropdown-trigger__arrow--up' : ''}`}>
              ▼
            </span>
          )}
        </div>
      </div>

      {/* 下拉列表 */}
      {isOpen && (
        <div className="dropdown-list-container">
          <ul
            ref={listRef}
            className="dropdown-list"
            style={{ ...defaultDropdownStyles.list, ...(listStyles as React.CSSProperties), maxHeight }}
          >
            {loading ? (
              <li className="dropdown-loading">{loadingText}</li>
            ) : filteredOptions.length === 0 ? (
              <li className="dropdown-no-options">{noOptionsText}</li>
            ) : (
              <>
                {/* 全选选项 */}
                {multiple && showSelectAll && filteredOptions.length > 1 && (
                  <li
                    className="dropdown-select-all"
                    onClick={handleSelectAll}
                  >
                    <input
                      type="checkbox"
                      checked={filteredOptions
                        .filter(opt => !opt.disabled)
                        .every(opt => Array.isArray(value) && value.includes(opt.value))
                      }
                      onChange={() => {}}
                    />
                    <span>{selectAllText}</span>
                  </li>
                )}

                {/* 选项列表 */}
                {Object.keys(groupedOptions).map(groupName => (
                  <React.Fragment key={groupName}>
                    {groupName !== 'default' && (
                      <li className="dropdown-group-header">{groupName}</li>
                    )}
                    {groupedOptions[groupName].map((option) => 
                      renderOptionItem(option, filteredOptions.indexOf(option))
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </ul>
        </div>
      )}

      {/* 帮助文本和错误信息 */}
      {(helperText || error) && (
        <div className="dropdown-helper">
          {error ? (
            <span className="dropdown-error">{error}</span>
          ) : (
            <span className="dropdown-helper-text">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 简化的Select组件
 */
export interface SelectProps extends Omit<ThemedDropdownProps, 'multiple' | 'searchable' | 'options'> {
  /** 选项列表(简化格式) */
  options?: string[] | { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ options = [], ...props }) => {
  const normalizedOptions: DropdownOption[] = options.map(option => {
    if (typeof option === 'string') {
      return { value: option, label: option };
    }
    return option;
  });

  return (
    <ThemedDropdown
      {...props}
      options={normalizedOptions}
      multiple={false}
      searchable={false}
    />
  );
};

/**
 * 多选组件
 */
export const MultiSelect: React.FC<ThemedDropdownProps> = (props) => {
  return (
    <ThemedDropdown
      {...props}
      multiple={true}
    />
  );
};

// 默认样式配置


export default ThemedDropdown;