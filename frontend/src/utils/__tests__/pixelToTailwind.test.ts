import {
  convertPixelToTailwind,
  generateSizeClasses,
  getDefaultSizeClasses,
  isValidPixelValue
} from '../pixelToTailwind';

describe('pixelToTailwind', () => {
  /**
   * 测试基础像素值转换功能
   */
  describe('convertPixelToTailwind', () => {
    test('converts common pixel values correctly', () => {
      expect(convertPixelToTailwind('20px')).toBe('5');
      expect(convertPixelToTailwind('40px')).toBe('10');
      expect(convertPixelToTailwind('60px')).toBe('15');
      expect(convertPixelToTailwind('80px')).toBe('20');
      expect(convertPixelToTailwind('100px')).toBe('25');
      expect(convertPixelToTailwind('120px')).toBe('30');
    });

    test('handles dynamic calculation for uncommon values', () => {
      expect(convertPixelToTailwind('50px')).toBe('12.5'); // 50/4 = 12.5
      expect(convertPixelToTailwind('70px')).toBe('17.5'); // 70/4 = 17.5
      expect(convertPixelToTailwind('90px')).toBe('22.5'); // 90/4 = 22.5
    });

    test('provides fallback for invalid inputs', () => {
      expect(convertPixelToTailwind('invalid')).toBe('20'); // 默认值
      expect(convertPixelToTailwind('')).toBe('20');
      expect(convertPixelToTailwind('abc')).toBe('20');
      expect(convertPixelToTailwind('px')).toBe('20');
    });

    test('handles edge cases', () => {
      expect(convertPixelToTailwind('0px')).toBe('0');
      expect(convertPixelToTailwind('4px')).toBe('1');
      expect(convertPixelToTailwind('200px')).toBe('50');
    });

    test('handles values without px suffix', () => {
      expect(convertPixelToTailwind('80')).toBe('20');
      expect(convertPixelToTailwind('100')).toBe('25');
    });
  });

  /**
   * 测试尺寸类名生成功能
   */
  describe('generateSizeClasses', () => {
    test('generates correct size classes for equal dimensions', () => {
      expect(generateSizeClasses('80px', '80px')).toBe('w-20 h-20');
      expect(generateSizeClasses('100px', '100px')).toBe('w-25 h-25');
      expect(generateSizeClasses('60px', '60px')).toBe('w-15 h-15');
    });

    test('generates correct size classes for different dimensions', () => {
      expect(generateSizeClasses('80px', '60px')).toBe('w-20 h-15');
      expect(generateSizeClasses('100px', '80px')).toBe('w-25 h-20');
    });

    test('handles invalid inputs gracefully', () => {
      expect(generateSizeClasses('invalid', '80px')).toBe('w-20 h-20');
      expect(generateSizeClasses('80px', 'invalid')).toBe('w-20 h-20');
      expect(generateSizeClasses('invalid', 'invalid')).toBe('w-20 h-20');
    });

    test('handles empty or null inputs', () => {
      expect(generateSizeClasses('', '80px')).toBe('w-20 h-20');
      expect(generateSizeClasses('80px', '')).toBe('w-20 h-20');
    });
  });

  /**
   * 测试默认尺寸类名获取功能
   */
  describe('getDefaultSizeClasses', () => {
    test('returns correct mobile default classes', () => {
      expect(getDefaultSizeClasses(true)).toBe('w-20 h-20');
    });

    test('returns correct desktop default classes', () => {
      expect(getDefaultSizeClasses(false)).toBe('w-24 h-24');
    });
  });

  /**
   * 测试像素值验证功能
   */
  describe('isValidPixelValue', () => {
    test('validates correct pixel values', () => {
      expect(isValidPixelValue('80px')).toBe(true);
      expect(isValidPixelValue('100px')).toBe(true);
      expect(isValidPixelValue('0px')).toBe(true);
      expect(isValidPixelValue('999px')).toBe(true);
    });

    test('validates numeric values without px', () => {
      expect(isValidPixelValue('80')).toBe(true);
      expect(isValidPixelValue('100')).toBe(true);
      expect(isValidPixelValue('0')).toBe(true);
    });

    test('rejects invalid values', () => {
      expect(isValidPixelValue('invalid')).toBe(false);
      expect(isValidPixelValue('')).toBe(false);
      expect(isValidPixelValue('abc')).toBe(false);
      expect(isValidPixelValue('px')).toBe(false);
      expect(isValidPixelValue('-10px')).toBe(false);
    });

    test('handles edge cases', () => {
      expect(isValidPixelValue('0')).toBe(true);
      expect(isValidPixelValue('0px')).toBe(true);
      expect(isValidPixelValue('1px')).toBe(true);
    });
  });

  /**
   * 测试性能和边界条件
   */
  describe('performance and edge cases', () => {
    test('handles large pixel values', () => {
      expect(convertPixelToTailwind('1000px')).toBe('250');
      expect(generateSizeClasses('1000px', '1000px')).toBe('w-250 h-250');
    });

    test('handles decimal pixel values', () => {
      expect(convertPixelToTailwind('80.5px')).toBe('20.125');
      expect(convertPixelToTailwind('100.25px')).toBe('25.0625');
    });

    test('performance with multiple calls', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        convertPixelToTailwind('80px');
        generateSizeClasses('80px', '80px');
        isValidPixelValue('80px');
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // 应该在合理时间内完成（小于100ms）
      expect(duration).toBeLessThan(100);
    });
  });

  /**
   * 测试实际使用场景
   */
  describe('real-world scenarios', () => {
    test('handles database config values', () => {
      // 模拟从数据库获取的配置值
      const dbConfig = {
        mobile: { width: '60px', height: '60px' },
        desktop: { width: '80px', height: '80px' }
      };
      
      expect(generateSizeClasses(dbConfig.mobile.width, dbConfig.mobile.height))
        .toBe('w-15 h-15');
      expect(generateSizeClasses(dbConfig.desktop.width, dbConfig.desktop.height))
        .toBe('w-20 h-20');
    });

    test('handles teacher avatar size variants', () => {
      // 模拟不同尺寸变体的配置
      const sizeVariants = {
        sm: { width: '60px', height: '60px' },
        md: { width: '80px', height: '80px' },
        lg: { width: '100px', height: '100px' }
      };
      
      expect(generateSizeClasses(sizeVariants.sm.width, sizeVariants.sm.height))
        .toBe('w-15 h-15');
      expect(generateSizeClasses(sizeVariants.md.width, sizeVariants.md.height))
        .toBe('w-20 h-20');
      expect(generateSizeClasses(sizeVariants.lg.width, sizeVariants.lg.height))
        .toBe('w-25 h-25');
    });

    test('ensures circular appearance with equal dimensions', () => {
      // 确保生成的类名会产生正圆形
      const circularClasses = generateSizeClasses('80px', '80px');
      const [widthClass, heightClass] = circularClasses.split(' ');
      
      // 宽度和高度类名应该相同（去掉前缀后）
      expect(widthClass.replace('w-', '')).toBe(heightClass.replace('h-', ''));
    });
  });
});