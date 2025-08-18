import { useResponsiveValue } from './useResponsive';

/**
 * 师资卡片高度管理Hook
 * 提供响应式的卡片高度配置，确保所有师资卡片高度统一
 * 
 * @returns {number} cardHeight - 当前断点下的卡片高度值
 */
export const useCardHeight = (): number => {
  // 定义各断点下的卡片高度配置 (已优化: +25%高度)
  const cardHeight = useResponsiveValue({
    xs: 400,  // 移动端小屏幕 (320 + 80)
    sm: 450,  // 移动端中屏幕 (360 + 90)
    md: 500,  // 平板和桌面端 (400 + 100)
    lg: 500,  // 大屏桌面端 (400 + 100)
  });

  return cardHeight;
};

/**
 * 师资卡片高度配置类型定义
 */
export interface CardHeightConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
}

/**
 * 默认卡片高度配置 (已优化: +25%高度)
 */
export const DEFAULT_CARD_HEIGHT_CONFIG: CardHeightConfig = {
  xs: 400,  // 320 + 80 (+25%)
  sm: 450,  // 360 + 90 (+25%)
  md: 500,  // 400 + 100 (+25%)
  lg: 500,  // 400 + 100 (+25%)
};