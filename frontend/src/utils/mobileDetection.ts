/**
 * 移动端设备检测和优化工具
 */

// 设备类型常量
export const DeviceType = {
  DESKTOP: 'desktop',
  TABLET: 'tablet',
  MOBILE: 'mobile'
} as const;

export type DeviceType = typeof DeviceType[keyof typeof DeviceType];

// 操作系统类型
export const OSType = {
  IOS: 'ios',
  ANDROID: 'android',
  WINDOWS: 'windows',
  MACOS: 'macos',
  LINUX: 'linux',
  UNKNOWN: 'unknown'
} as const;

export type OSType = typeof OSType[keyof typeof OSType];

// 浏览器类型
export const BrowserType = {
  CHROME: 'chrome',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
  EDGE: 'edge',
  OPERA: 'opera',
  UNKNOWN: 'unknown'
} as const;

export type BrowserType = typeof BrowserType[keyof typeof BrowserType];

// 设备能力接口
export interface DeviceCapabilities {
  hasTouch: boolean;
  hasHover: boolean;
  hasPointer: boolean;
  supportsVibration: boolean;
  supportsOrientation: boolean;
  supportsDeviceMotion: boolean;
  supportsWebGL: boolean;
  pixelRatio: number;
  maxTouchPoints: number;
}

// 屏幕信息接口
export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  orientation: string;
  pixelRatio: number;
}

/**
 * 检测设备类型
 */
export const detectDeviceType = (): DeviceType => {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const minDimension = Math.min(screenWidth, screenHeight);
  const maxDimension = Math.max(screenWidth, screenHeight);

  // 检查是否为移动设备
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUA = mobileRegex.test(userAgent);

  // 基于屏幕尺寸判断
  if (minDimension <= 480 || (isMobileUA && maxDimension <= 896)) {
    return DeviceType.MOBILE;
  }
  
  if (minDimension <= 768 || (isMobileUA && maxDimension <= 1024)) {
    return DeviceType.TABLET;
  }
  
  return DeviceType.DESKTOP;
};

/**
 * 检测操作系统类型
 */
export const detectOSType = (): OSType => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return OSType.IOS;
  }
  
  if (/android/.test(userAgent)) {
    return OSType.ANDROID;
  }
  
  if (/win/.test(platform)) {
    return OSType.WINDOWS;
  }
  
  if (/mac/.test(platform)) {
    return OSType.MACOS;
  }
  
  if (/linux/.test(platform)) {
    return OSType.LINUX;
  }
  
  return OSType.UNKNOWN;
};

/**
 * 检测浏览器类型
 */
export const detectBrowserType = (): BrowserType => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/chrome/.test(userAgent) && !/edge/.test(userAgent)) {
    return BrowserType.CHROME;
  }
  
  if (/firefox/.test(userAgent)) {
    return BrowserType.FIREFOX;
  }
  
  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
    return BrowserType.SAFARI;
  }
  
  if (/edge/.test(userAgent)) {
    return BrowserType.EDGE;
  }
  
  if (/opera/.test(userAgent)) {
    return BrowserType.OPERA;
  }
  
  return BrowserType.UNKNOWN;
};

/**
 * 检测设备能力
 */
export const detectDeviceCapabilities = (): DeviceCapabilities => {
  return {
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hasHover: window.matchMedia('(hover: hover)').matches,
    hasPointer: window.matchMedia('(pointer: fine)').matches,
    supportsVibration: 'vibrate' in navigator,
    supportsOrientation: 'orientation' in window || 'onorientationchange' in window,
    supportsDeviceMotion: 'DeviceMotionEvent' in window,
    supportsWebGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    })(),
    pixelRatio: window.devicePixelRatio || 1,
    maxTouchPoints: navigator.maxTouchPoints || 0
  };
};

/**
 * 获取屏幕信息
 */
export const getScreenInfo = (): ScreenInfo => {
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    orientation: window.screen.orientation?.type || 'unknown',
    pixelRatio: window.devicePixelRatio || 1
  };
};

/**
 * 检查是否为移动设备
 */
export const isMobileDevice = (): boolean => {
  return detectDeviceType() === DeviceType.MOBILE;
};

/**
 * 检查是否为平板设备
 */
export const isTabletDevice = (): boolean => {
  return detectDeviceType() === DeviceType.TABLET;
};

/**
 * 检查是否为桌面设备
 */
export const isDesktopDevice = (): boolean => {
  return detectDeviceType() === DeviceType.DESKTOP;
};

/**
 * 检查是否支持触摸
 */
export const isTouchDevice = (): boolean => {
  return detectDeviceCapabilities().hasTouch;
};

/**
 * 检查是否为iOS设备
 */
export const isIOSDevice = (): boolean => {
  return detectOSType() === OSType.IOS;
};

/**
 * 检查是否为Android设备
 */
export const isAndroidDevice = (): boolean => {
  return detectOSType() === OSType.ANDROID;
};

/**
 * 检查是否为Safari浏览器
 */
export const isSafariBrowser = (): boolean => {
  return detectBrowserType() === BrowserType.SAFARI;
};

/**
 * 获取安全区域信息（用于处理刘海屏等）
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0')
  };
};

/**
 * 设置视口元标签（用于移动端优化）
 */
export const setViewportMeta = (options: {
  width?: string;
  initialScale?: number;
  minimumScale?: number;
  maximumScale?: number;
  userScalable?: boolean;
  viewportFit?: 'auto' | 'contain' | 'cover';
} = {}) => {
  const {
    width = 'device-width',
    initialScale = 1,
    minimumScale = 1,
    maximumScale = 1,
    userScalable = false,
    viewportFit = 'cover'
  } = options;

  let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }

  const content = [
    `width=${width}`,
    `initial-scale=${initialScale}`,
    `minimum-scale=${minimumScale}`,
    `maximum-scale=${maximumScale}`,
    `user-scalable=${userScalable ? 'yes' : 'no'}`,
    `viewport-fit=${viewportFit}`
  ].join(', ');

  viewport.content = content;
};

/**
 * 添加移动端优化的CSS类
 */
export const addMobileOptimizationClasses = () => {
  const deviceType = detectDeviceType();
  const osType = detectOSType();
  const browserType = detectBrowserType();
  const capabilities = detectDeviceCapabilities();

  const classes = [
    `device-${deviceType}`,
    `os-${osType}`,
    `browser-${browserType}`,
    capabilities.hasTouch ? 'has-touch' : 'no-touch',
    capabilities.hasHover ? 'has-hover' : 'no-hover',
    capabilities.hasPointer ? 'has-pointer' : 'no-pointer',
    `pixel-ratio-${Math.floor(capabilities.pixelRatio)}`
  ];

  document.documentElement.classList.add(...classes);
};

/**
 * 移动端性能优化
 */
export const optimizeForMobile = () => {
  // 设置视口
  setViewportMeta();
  
  // 添加CSS类
  addMobileOptimizationClasses();
  
  // 禁用双击缩放（iOS Safari）
  if (isIOSDevice() && isSafariBrowser()) {
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }
  
  // 优化滚动性能
  if (isTouchDevice()) {
    const bodyStyle = document.body.style as any;
    if ('webkitOverflowScrolling' in bodyStyle) {
      bodyStyle.webkitOverflowScrolling = 'touch';
    }
  }
};

/**
 * 获取设备信息摘要
 */
export const getDeviceInfo = () => {
  return {
    deviceType: detectDeviceType(),
    osType: detectOSType(),
    browserType: detectBrowserType(),
    capabilities: detectDeviceCapabilities(),
    screenInfo: getScreenInfo(),
    safeAreaInsets: getSafeAreaInsets(),
    userAgent: navigator.userAgent
  };
};

/**
 * 移动端调试信息
 */
export const logDeviceInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('📱 Device Information');
    console.table(getDeviceInfo());
    console.groupEnd();
  }
};

// 自动初始化移动端优化
if (typeof window !== 'undefined') {
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeForMobile();
      logDeviceInfo();
    });
  } else {
    optimizeForMobile();
    logDeviceInfo();
  }
}