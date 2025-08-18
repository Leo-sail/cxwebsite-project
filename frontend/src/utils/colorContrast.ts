/**
 * 颜色对比度计算工具
 * 用于验证WCAG AA可访问性标准
 */

/**
 * 将十六进制颜色转换为RGB值
 * @param hex 十六进制颜色值 (如: #3B82F6)
 * @returns RGB数组 [r, g, b]
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

/**
 * 计算相对亮度
 * @param rgb RGB数组 [r, g, b]
 * @returns 相对亮度值 (0-1)
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 计算两种颜色的对比度
 * @param color1 第一种颜色的十六进制值
 * @param color2 第二种颜色的十六进制值
 * @returns 对比度比值 (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format');
  }
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * 检查对比度是否符合WCAG AA标准
 * @param contrastRatio 对比度比值
 * @param level 文字级别 ('normal' | 'large')
 * @returns 是否符合标准
 */
export function meetsWCAGAA(contrastRatio: number, level: 'normal' | 'large' = 'normal'): boolean {
  const threshold = level === 'large' ? 3 : 4.5;
  return contrastRatio >= threshold;
}

/**
 * 检查对比度是否符合WCAG AAA标准
 * @param contrastRatio 对比度比值
 * @param level 文字级别 ('normal' | 'large')
 * @returns 是否符合标准
 */
export function meetsWCAGAAA(contrastRatio: number, level: 'normal' | 'large' = 'normal'): boolean {
  const threshold = level === 'large' ? 4.5 : 7;
  return contrastRatio >= threshold;
}

/**
 * Tailwind CSS颜色映射
 * 用于获取具体的十六进制颜色值
 */
export const tailwindColors = {
  'blue-500': '#3B82F6',
  'blue-600': '#2563EB',
  'blue-700': '#1D4ED8',
  'blue-800': '#1E40AF',
  'blue-900': '#1E3A8A',
  'white': '#FFFFFF',
  'black': '#000000'
} as const;

/**
 * 验证文章页面Hero区域的颜色对比度
 * @returns 验证结果
 */
export function validateArticlePageContrast() {
  const results = {
    original: {
      background: 'blue-500 to blue-700',
      foreground: 'white',
      contrastRatio: 0,
      meetsAA: false,
      meetsAAA: false
    },
    deep: {
      background: 'blue-700 to blue-900',
      foreground: 'white',
      contrastRatio: 0,
      meetsAA: false,
      meetsAAA: false
    }
  };
  
  // 计算原始渐变的平均对比度 (blue-500 + blue-700) / 2 vs white
  const originalAvg = '#2563EB'; // 大约是blue-500和blue-700的中间值
  results.original.contrastRatio = getContrastRatio(originalAvg, tailwindColors.white);
  results.original.meetsAA = meetsWCAGAA(results.original.contrastRatio);
  results.original.meetsAAA = meetsWCAGAAA(results.original.contrastRatio);
  
  // 计算深色渐变的平均对比度 (blue-700 + blue-900) / 2 vs white
  const deepAvg = '#1E3A8A'; // 大约是blue-700和blue-900的中间值
  results.deep.contrastRatio = getContrastRatio(deepAvg, tailwindColors.white);
  results.deep.meetsAA = meetsWCAGAA(results.deep.contrastRatio);
  results.deep.meetsAAA = meetsWCAGAAA(results.deep.contrastRatio);
  
  return results;
}