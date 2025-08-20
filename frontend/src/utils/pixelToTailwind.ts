/**
 * 像素值到Tailwind CSS类名转换工具
 * 
 * 该工具用于将数据库中存储的像素值（如 "80px"）转换为有效的Tailwind CSS类名（如 "20"）
 * 解决TeacherAvatar组件中CSS类名生成问题，确保头像能正确显示为圆形
 */

/**
 * 预定义的像素值到Tailwind类名映射表
 * 基于Tailwind CSS的标准尺寸体系：1单位 = 4px
 */
const PIXEL_TO_TAILWIND_MAP: Record<string, string> = {
  '16px': '4',   // w-4 h-4 (16px)
  '20px': '5',   // w-5 h-5 (20px)
  '24px': '6',   // w-6 h-6 (24px)
  '28px': '7',   // w-7 h-7 (28px)
  '32px': '8',   // w-8 h-8 (32px)
  '36px': '9',   // w-9 h-9 (36px)
  '40px': '10',  // w-10 h-10 (40px)
  '44px': '11',  // w-11 h-11 (44px)
  '48px': '12',  // w-12 h-12 (48px)
  '52px': '13',  // w-13 h-13 (52px)
  '56px': '14',  // w-14 h-14 (56px)
  '60px': '15',  // w-15 h-15 (60px)
  '64px': '16',  // w-16 h-16 (64px)
  '68px': '17',  // w-17 h-17 (68px)
  '72px': '18',  // w-18 h-18 (72px)
  '76px': '19',  // w-19 h-19 (76px)
  '80px': '20',  // w-20 h-20 (80px)
  '84px': '21',  // w-21 h-21 (84px)
  '88px': '22',  // w-22 h-22 (88px)
  '92px': '23',  // w-23 h-23 (92px)
  '96px': '24',  // w-24 h-24 (96px)
  '100px': '25', // w-25 h-25 (100px)
  '104px': '26', // w-26 h-26 (104px)
  '108px': '27', // w-27 h-27 (108px)
  '112px': '28', // w-28 h-28 (112px)
  '116px': '29', // w-29 h-29 (116px)
  '120px': '30', // w-30 h-30 (120px)
  '128px': '32', // w-32 h-32 (128px)
};

/**
 * 将像素值转换为Tailwind CSS类名数值
 * 
 * @param pixelValue - 像素值字符串，如 "80px"
 * @returns Tailwind CSS类名数值，如 "20"
 * 
 * @example
 * ```typescript
 * convertPixelToTailwind("80px") // 返回 "20"
 * convertPixelToTailwind("60px") // 返回 "15"
 * convertPixelToTailwind("100px") // 返回 "25"
 * ```
 */
export function convertPixelToTailwind(pixelValue: string): string {
  // 首先尝试从预定义映射表中查找
  if (PIXEL_TO_TAILWIND_MAP[pixelValue]) {
    return PIXEL_TO_TAILWIND_MAP[pixelValue];
  }

  // 如果映射表中没有，则使用动态计算
  // Tailwind CSS规则：1单位 = 4px，所以像素值除以4得到Tailwind数值
  try {
    const pixels = parseInt(pixelValue.replace('px', ''), 10);
    
    // 验证解析结果是否为有效数字
    if (isNaN(pixels) || pixels <= 0) {
      console.warn(`[pixelToTailwind] 无效的像素值: ${pixelValue}，使用默认值`);
      return '20'; // 默认80px对应的Tailwind值
    }

    // 计算Tailwind数值，四舍五入到最近的整数
    const tailwindSize = Math.round(pixels / 4);
    
    // 确保结果在合理范围内（1-96，对应4px-384px）
    const clampedSize = Math.max(1, Math.min(96, tailwindSize));
    
    return clampedSize.toString();
  } catch (error) {
    console.error(`[pixelToTailwind] 解析像素值时出错: ${pixelValue}`, error);
    return '20'; // 发生错误时返回默认值
  }
}

/**
 * 生成完整的尺寸CSS类名
 * 
 * @param width - 宽度像素值，如 "80px"
 * @param height - 高度像素值，如 "80px"
 * @returns 完整的CSS类名字符串，如 "w-20 h-20"
 * 
 * @example
 * ```typescript
 * generateSizeClasses("80px", "80px") // 返回 "w-20 h-20"
 * generateSizeClasses("60px", "60px") // 返回 "w-15 h-15"
 * generateSizeClasses("100px", "100px") // 返回 "w-25 h-25"
 * ```
 */
export function generateSizeClasses(width: string, height: string): string {
  const widthClass = convertPixelToTailwind(width);
  const heightClass = convertPixelToTailwind(height);
  
  return `w-${widthClass} h-${heightClass}`;
}

/**
 * 获取默认的尺寸CSS类名
 * 
 * 当配置数据缺失或无效时使用的安全默认值
 * 
 * @param isMobile - 是否为移动端
 * @returns 默认的CSS类名字符串
 * 
 * @example
 * ```typescript
 * getDefaultSizeClasses(true)  // 返回 "w-15 h-15" (移动端60px)
 * getDefaultSizeClasses(false) // 返回 "w-20 h-20" (桌面端80px)
 * ```
 */
export function getDefaultSizeClasses(isMobile: boolean): string {
  // 移动端默认60px (w-15 h-15)，桌面端默认80px (w-20 h-20)
  return isMobile ? 'w-15 h-15' : 'w-20 h-20';
}

/**
 * 验证像素值格式是否正确
 * 
 * @param pixelValue - 要验证的像素值字符串
 * @returns 是否为有效的像素值格式
 * 
 * @example
 * ```typescript
 * isValidPixelValue("80px")   // 返回 true
 * isValidPixelValue("80")     // 返回 false
 * isValidPixelValue("abc")    // 返回 false
 * isValidPixelValue("")       // 返回 false
 * ```
 */
export function isValidPixelValue(pixelValue: string): boolean {
  if (!pixelValue || typeof pixelValue !== 'string') {
    return false;
  }
  
  // 检查是否以'px'结尾且前面是有效数字
  const pixelRegex = /^\d+px$/;
  return pixelRegex.test(pixelValue);
}

/**
 * 像素值转换工具的类型定义
 */
export interface PixelToTailwindConverter {
  convertPixelToTailwind(pixelValue: string): string;
  generateSizeClasses(width: string, height: string): string;
  getDefaultSizeClasses(isMobile: boolean): string;
  isValidPixelValue(pixelValue: string): boolean;
}

/**
 * 像素值转换工具实例
 * 
 * 提供一个统一的接口来访问所有转换功能
 */
export const pixelToTailwindConverter: PixelToTailwindConverter = {
  convertPixelToTailwind,
  generateSizeClasses,
  getDefaultSizeClasses,
  isValidPixelValue,
};

/**
 * 默认导出转换工具实例
 */
export default pixelToTailwindConverter;