/**
 * 媒体验证工具函数
 * 用于验证媒体元素的src属性，避免空字符串导致的浏览器重新下载页面问题
 */

/**
 * 验证src属性是否为有效的非空字符串
 * 
 * @param src - 要验证的src属性值
 * @returns 如果src是有效的非空字符串则返回true，否则返回false
 * 
 * @example
 * ```typescript
 * isValidSrc('https://example.com/video.mp4') // true
 * isValidSrc('') // false
 * isValidSrc(null) // false
 * isValidSrc(undefined) // false
 * isValidSrc('   ') // false (只包含空白字符)
 * ```
 */
export const isValidSrc = (src: string | null | undefined): src is string => {
  return Boolean(src && typeof src === 'string' && src.trim() !== '');
};

/**
 * 验证图片src属性是否有效
 * 
 * @param src - 要验证的图片src属性值
 * @returns 如果src是有效的图片URL则返回true，否则返回false
 * 
 * @example
 * ```typescript
 * isValidImageSrc('https://example.com/image.jpg') // true
 * isValidImageSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==') // true
 * isValidImageSrc('') // false
 * ```
 */
export const isValidImageSrc = (src: string | null | undefined): src is string => {
  if (!isValidSrc(src)) {
    return false;
  }
  
  // 检查是否是data:image格式
  if (src.startsWith('data:image/')) {
    return true;
  }
  
  // 检查是否是有效的图片文件扩展名
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
  return imageExtensions.test(src);
};

/**
 * 验证视频src属性是否有效
 * 
 * @param src - 要验证的视频src属性值
 * @returns 如果src是有效的视频URL则返回true，否则返回false
 * 
 * @example
 * ```typescript
 * isValidVideoSrc('https://example.com/video.mp4') // true
 * isValidVideoSrc('blob:https://example.com/12345678-1234-1234-1234-123456789012') // true
 * isValidVideoSrc('') // false
 * ```
 */
export const isValidVideoSrc = (src: string | null | undefined): src is string => {
  if (!isValidSrc(src)) {
    return false;
  }
  
  // 检查是否是有效的视频URL格式
  const videoUrlPattern = /^(https?:\/\/|blob:|data:video\/|\.\/|\/)/i;
  return videoUrlPattern.test(src);
};

/**
 * 验证音频src属性是否有效
 * 
 * @param src - 要验证的音频src属性值
 * @returns 如果src是有效的音频URL则返回true，否则返回false
 * 
 * @example
 * ```typescript
 * isValidAudioSrc('https://example.com/audio.mp3') // true
 * isValidAudioSrc('') // false
 * ```
 */
export const isValidAudioSrc = (src: string | null | undefined): src is string => {
  if (!isValidSrc(src)) {
    return false;
  }
  
  // 检查是否是有效的音频URL格式
  const audioUrlPattern = /^(https?:\/\/|blob:|data:audio\/|\.\/|\/)/i;
  return audioUrlPattern.test(src);
};

/**
 * 获取媒体类型的默认占位符URL
 * 
 * @param mediaType - 媒体类型 ('image' | 'video' | 'audio')
 * @returns 对应媒体类型的占位符URL
 */
export const getDefaultPlaceholder = (mediaType: 'image' | 'video' | 'audio'): string => {
  const placeholders = {
    image: 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=暂无图片',
    video: 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=暂无视频',
    audio: 'https://via.placeholder.com/400x100/f3f4f6/9ca3af?text=暂无音频'
  };
  
  return placeholders[mediaType];
};

/**
 * 安全获取媒体src，如果无效则返回占位符
 * 
 * @param src - 原始src值
 * @param mediaType - 媒体类型
 * @returns 有效的src或占位符URL
 * 
 * @example
 * ```typescript
 * getSafeSrc('https://example.com/image.jpg', 'image') // 'https://example.com/image.jpg'
 * getSafeSrc('', 'image') // 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=暂无图片'
 * ```
 */
export const getSafeSrc = (
  src: string | null | undefined, 
  mediaType: 'image' | 'video' | 'audio'
): string => {
  const validators = {
    image: isValidImageSrc,
    video: isValidVideoSrc,
    audio: isValidAudioSrc
  };
  
  const validator = validators[mediaType];
  
  if (validator(src)) {
    return src;
  }
  
  return getDefaultPlaceholder(mediaType);
};

/**
 * 媒体验证结果类型
 */
export interface MediaValidationResult {
  isValid: boolean;
  src: string | null;
  mediaType: 'image' | 'video' | 'audio';
  placeholder?: string;
  error?: string;
}

/**
 * 全面验证媒体src并返回详细结果
 * 
 * @param src - 要验证的src值
 * @param mediaType - 媒体类型
 * @returns 验证结果对象
 * 
 * @example
 * ```typescript
 * validateMediaSrc('https://example.com/video.mp4', 'video')
 * // { isValid: true, src: 'https://example.com/video.mp4' }
 * 
 * validateMediaSrc('', 'video')
 * // { isValid: false, src: null, placeholder: 'https://via.placeholder.com/...', error: 'Empty src provided' }
 * ```
 */
export const validateMediaSrc = (
  src: string | null | undefined,
  mediaType: 'image' | 'video' | 'audio'
): MediaValidationResult => {
  // 检查是否为空值
  if (src === null || src === undefined) {
    return {
      isValid: false,
      src: null,
      mediaType,
      placeholder: getDefaultPlaceholder(mediaType),
      error: 'Null or undefined src provided'
    };
  }
  
  // 检查是否为空字符串或只包含空白字符
  if (typeof src !== 'string' || src.trim() === '') {
    return {
      isValid: false,
      src: null,
      mediaType,
      placeholder: getDefaultPlaceholder(mediaType),
      error: 'Empty src provided'
    };
  }
  
  // 根据媒体类型进行具体验证
  const validators = {
    image: isValidImageSrc,
    video: isValidVideoSrc,
    audio: isValidAudioSrc
  };
  
  const validator = validators[mediaType];
  
  if (validator(src)) {
    return {
      isValid: true,
      src: src.trim(),
      mediaType
    };
  }
  
  return {
    isValid: false,
    src: null,
    mediaType,
    placeholder: getDefaultPlaceholder(mediaType),
    error: `Invalid ${mediaType} URL format`
  };
};

/**
 * 开发环境下的调试日志函数
 * 
 * @param message - 日志消息
 * @param data - 附加数据
 */
export const logMediaValidation = (message: string, data?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[MediaValidation] ${message}`, data || '');
  }
};