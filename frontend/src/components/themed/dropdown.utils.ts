/**
 * Dropdown组件的默认样式配置
 */
export const defaultDropdownStyles = {
  base: {
    position: 'relative' as const,
    width: '100%',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--dropdown-padding, 0.5rem 0.75rem)',
    border: 'var(--dropdown-border, 1px solid #d1d5db)',
    borderRadius: 'var(--dropdown-border-radius, 0.375rem)',
    backgroundColor: 'var(--dropdown-bg, #ffffff)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  list: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'var(--dropdown-list-bg, #ffffff)',
    border: 'var(--dropdown-list-border, 1px solid #d1d5db)',
    borderRadius: 'var(--dropdown-list-border-radius, 0.375rem)',
    boxShadow: 'var(--dropdown-list-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
    overflow: 'auto',
    marginTop: '0.25rem',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--dropdown-option-padding, 0.5rem 0.75rem)',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  }
};