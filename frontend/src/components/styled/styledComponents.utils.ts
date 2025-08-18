/**
 * 样式化组件常量和配置
 * 从StyledComponents.tsx中分离出的非组件导出
 */
import type { ComponentStyleConfig } from '../../types/style';

/**
 * 样式化容器组件配置
 */
export const containerStyles: ComponentStyleConfig = {
  base: {
    display: 'block',
    boxSizing: 'border-box',
    margin: '0',
    padding: '0'
  },
  variants: {
    flex: {
      display: 'flex'
    },
    'flex-col': {
      display: 'flex',
      flexDirection: 'column'
    },
    'flex-row': {
      display: 'flex',
      flexDirection: 'row'
    },
    grid: {
      display: 'grid'
    },
    inline: {
      display: 'inline-block'
    },
    card: {
      backgroundColor: 'var(--color-background, #ffffff)',
      border: '1px solid var(--color-border, #e5e7eb)',
      borderRadius: 'var(--border-radius-lg, 0.5rem)',
      boxShadow: 'var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
      padding: 'var(--spacing-4, 1rem)'
    },
    section: {
      padding: 'var(--spacing-6, 1.5rem) 0'
    }
  },
  sizes: {
    xs: {
      padding: 'var(--spacing-1, 0.25rem)'
    },
    sm: {
      padding: 'var(--spacing-2, 0.5rem)'
    },
    md: {
      padding: 'var(--spacing-4, 1rem)'
    },
    lg: {
      padding: 'var(--spacing-6, 1.5rem)'
    },
    xl: {
      padding: 'var(--spacing-8, 2rem)'
    }
  }
};

/**
 * 样式化文本组件配置
 */
export const textStyles: ComponentStyleConfig = {
  base: {
    margin: '0',
    padding: '0',
    fontFamily: 'var(--font-primary, inherit)',
    lineHeight: '1.5',
    color: 'var(--color-text, #374151)'
  },
  variants: {
    body: {
      fontSize: 'var(--font-size-base, 1rem)',
      fontWeight: '400'
    },
    caption: {
      fontSize: 'var(--font-size-sm, 0.875rem)',
      fontWeight: '400',
      color: 'var(--color-text-secondary, #6b7280)'
    },
    label: {
      fontSize: 'var(--font-size-sm, 0.875rem)',
      fontWeight: '500'
    },
    link: {
      color: 'var(--color-primary, #3b82f6)',
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    muted: {
      color: 'var(--color-text-muted, #9ca3af)'
    },
    error: {
      color: 'var(--color-danger, #ef4444)'
    },
    success: {
      color: 'var(--color-success, #10b981)'
    },
    warning: {
      color: 'var(--color-warning, #f59e0b)'
    }
  },
  sizes: {
    xs: {
      fontSize: 'var(--font-size-xs, 0.75rem)'
    },
    sm: {
      fontSize: 'var(--font-size-sm, 0.875rem)'
    },
    md: {
      fontSize: 'var(--font-size-base, 1rem)'
    },
    lg: {
      fontSize: 'var(--font-size-lg, 1.125rem)'
    },
    xl: {
      fontSize: 'var(--font-size-xl, 1.25rem)'
    }
  }
};

/**
 * 样式化标题组件配置
 */
export const headingStyles: ComponentStyleConfig = {
  base: {
    margin: '0',
    padding: '0',
    fontFamily: 'var(--font-primary, inherit)',
    fontWeight: '600',
    lineHeight: '1.2',
    color: 'var(--color-text, #374151)'
  },
  variants: {
    primary: {
      color: 'var(--color-primary, #3b82f6)'
    },
    secondary: {
      color: 'var(--color-secondary, #6b7280)'
    },
    gradient: {
      background: 'linear-gradient(135deg, var(--color-primary, #3b82f6), var(--color-secondary, #6b7280))',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }
  },
  sizes: {
    h1: {
      fontSize: 'var(--font-size-4xl, 2.25rem)'
    },
    h2: {
      fontSize: 'var(--font-size-3xl, 1.875rem)'
    },
    h3: {
      fontSize: 'var(--font-size-2xl, 1.5rem)'
    },
    h4: {
      fontSize: 'var(--font-size-xl, 1.25rem)'
    },
    h5: {
      fontSize: 'var(--font-size-lg, 1.125rem)'
    },
    h6: {
      fontSize: 'var(--font-size-base, 1rem)'
    }
  }
};

/**
 * 样式化输入框组件配置
 */
export const inputStyles: ComponentStyleConfig = {
  base: {
    display: 'block',
    width: '100%',
    fontFamily: 'var(--font-primary, inherit)',
    fontSize: 'var(--font-size-base, 1rem)',
    lineHeight: '1.5',
    color: 'var(--color-text, #374151)',
    backgroundColor: 'var(--color-background, #ffffff)',
    border: '1px solid var(--color-border, #d1d5db)',
    borderRadius: 'var(--border-radius-md, 0.375rem)',
    padding: 'var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem)',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    outline: 'none'
  },
  variants: {
    default: {},
    filled: {
      backgroundColor: 'var(--color-background-secondary, #f9fafb)',
      border: '1px solid transparent'
    },
    outlined: {
      backgroundColor: 'transparent',
      border: '2px solid var(--color-border, #d1d5db)'
    },
    underlined: {
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '2px solid var(--color-border, #d1d5db)',
      borderRadius: '0',
      padding: 'var(--spacing-2, 0.5rem) 0'
    }
  },
  sizes: {
    sm: {
      fontSize: 'var(--font-size-sm, 0.875rem)',
      padding: 'var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem)'
    },
    md: {
      fontSize: 'var(--font-size-base, 1rem)',
      padding: 'var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem)'
    },
    lg: {
      fontSize: 'var(--font-size-lg, 1.125rem)',
      padding: 'var(--spacing-3, 0.75rem) var(--spacing-4, 1rem)'
    }
  }
};

/**
 * 样式化按钮组件配置
 */
export const buttonStyles: ComponentStyleConfig = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-primary, inherit)',
    fontWeight: '500',
    textDecoration: 'none',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle'
  },
  variants: {
    primary: {
      backgroundColor: 'var(--color-primary, #3b82f6)',
      color: 'var(--color-primary-foreground, white)',
      borderColor: 'var(--color-primary, #3b82f6)'
    },
    secondary: {
      backgroundColor: 'var(--color-secondary, #6b7280)',
      color: 'var(--color-secondary-foreground, white)',
      borderColor: 'var(--color-secondary, #6b7280)'
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary, #3b82f6)',
      borderColor: 'var(--color-primary, #3b82f6)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text, #374151)',
      borderColor: 'transparent'
    }
  },
  sizes: {
    sm: {
      fontSize: 'var(--font-size-sm, 0.875rem)',
      padding: 'var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem)',
      borderRadius: 'var(--border-radius-md, 0.375rem)'
    },
    md: {
      fontSize: 'var(--font-size-base, 1rem)',
      padding: 'var(--spacing-2, 0.5rem) var(--spacing-4, 1rem)',
      borderRadius: 'var(--border-radius-md, 0.375rem)'
    },
    lg: {
      fontSize: 'var(--font-size-lg, 1.125rem)',
      padding: 'var(--spacing-3, 0.75rem) var(--spacing-6, 1.5rem)',
      borderRadius: 'var(--border-radius-lg, 0.5rem)'
    }
  }
};

import { StyledComponentFactories } from '../../utils/styledComponentUtils';

/**
 * 创建样式化组件集合
 */
export const createStyledComponentsCollection = () => {
  const StyledContainer = StyledComponentFactories.createContainer('Container', containerStyles);
  const StyledText = StyledComponentFactories.createText('Text', textStyles);
  const StyledHeading = StyledComponentFactories.createHeading('Heading', headingStyles);
  const StyledInput = StyledComponentFactories.createInput('Input', inputStyles);
  const StyledButton = StyledComponentFactories.createButton('Button', buttonStyles);

  return {
    Container: StyledContainer,
    Text: StyledText,
    Heading: StyledHeading,
    Input: StyledInput,
    Button: StyledButton
  };
};

/**
 * 导出所有样式化组件
 */
export const StyledComponents = createStyledComponentsCollection();