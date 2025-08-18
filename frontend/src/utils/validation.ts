/**
 * 表单验证工具函数
 */

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 * @param phone 手机号
 * @returns 是否为有效手机号
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * 验证密码强度
 * @param password 密码
 * @param minLength 最小长度，默认8位
 * @returns 验证结果对象
 */
export function validatePassword(
  password: string,
  minLength: number = 8
): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let score = 0;

  // 检查长度
  if (password.length < minLength) {
    errors.push(`密码长度至少${minLength}位`);
  } else {
    score += 1;
  }

  // 检查是否包含小写字母
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  } else {
    score += 1;
  }

  // 检查是否包含大写字母
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  } else {
    score += 1;
  }

  // 检查是否包含数字
  if (!/\d/.test(password)) {
    errors.push('密码必须包含数字');
  } else {
    score += 1;
  }

  // 检查是否包含特殊字符
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含特殊字符');
  } else {
    score += 1;
  }

  // 计算强度
  let strength: 'weak' | 'medium' | 'strong';
  if (score < 3) {
    strength = 'weak';
  } else if (score < 5) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * 验证URL格式
 * @param url URL地址
 * @returns 是否为有效URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证身份证号码（中国大陆）
 * @param idCard 身份证号码
 * @returns 是否为有效身份证号码
 */
export function isValidIdCard(idCard: string): boolean {
  // 18位身份证号码正则
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  
  if (!idCardRegex.test(idCard)) {
    return false;
  }

  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }
  
  const checkCode = checkCodes[sum % 11];
  return checkCode === idCard[17].toUpperCase();
}

/**
 * 验证必填字段
 * @param value 字段值
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export function validateRequired(
  value: unknown,
  fieldName: string
): { isValid: boolean; error?: string } {
  const isEmpty = value === null || value === undefined || 
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);
  
  return {
    isValid: !isEmpty,
    error: isEmpty ? `${fieldName}不能为空` : undefined,
  };
}

/**
 * 验证字符串长度
 * @param value 字符串值
 * @param minLength 最小长度
 * @param maxLength 最大长度
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export function validateLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): { isValid: boolean; error?: string } {
  if (value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName}长度不能少于${minLength}个字符`,
    };
  }
  
  if (value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName}长度不能超过${maxLength}个字符`,
    };
  }
  
  return { isValid: true };
}

/**
 * 验证数字范围
 * @param value 数字值
 * @param min 最小值
 * @param max 最大值
 * @param fieldName 字段名称
 * @returns 验证结果
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): { isValid: boolean; error?: string } {
  if (value < min) {
    return {
      isValid: false,
      error: `${fieldName}不能小于${min}`,
    };
  }
  
  if (value > max) {
    return {
      isValid: false,
      error: `${fieldName}不能大于${max}`,
    };
  }
  
  return { isValid: true };
}

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的文件类型数组
 * @returns 验证结果
 */
export function validateFileType(
  file: File,
  allowedTypes: string[]
): { isValid: boolean; error?: string } {
  const fileType = file.type;
  const isValid = allowedTypes.includes(fileType);
  
  return {
    isValid,
    error: isValid ? undefined : `不支持的文件类型，仅支持：${allowedTypes.join(', ')}`,
  };
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大文件大小（字节）
 * @returns 验证结果
 */
export function validateFileSize(
  file: File,
  maxSize: number
): { isValid: boolean; error?: string } {
  const isValid = file.size <= maxSize;
  const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
  
  return {
    isValid,
    error: isValid ? undefined : `文件大小不能超过${maxSizeMB}MB`,
  };
}