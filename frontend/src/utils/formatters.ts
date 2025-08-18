/**
 * 格式化工具函数
 */

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param num 数字
 * @param decimals 小数位数
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number, decimals?: number): string {
  const options: Intl.NumberFormatOptions = {
    useGrouping: true,
  };
  
  if (decimals !== undefined) {
    options.minimumFractionDigits = decimals;
    options.maximumFractionDigits = decimals;
  }
  
  return new Intl.NumberFormat('zh-CN', options).format(num);
}

/**
 * 格式化货币
 * @param amount 金额
 * @param currency 货币代码，默认CNY
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(
  amount: number,
  currency: string = 'CNY',
  decimals: number = 2
): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * 格式化百分比
 * @param value 数值（0-1之间）
 * @param decimals 小数位数，默认1位
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * 截断文本并添加省略号
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀，默认为'...'
 * @returns 截断后的文本
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 格式化手机号（添加空格分隔）
 * @param phone 手机号
 * @returns 格式化后的手机号
 */
export function formatPhone(phone: string): string {
  // 移除所有非数字字符
  const cleaned = phone.replace(/\D/g, '');
  
  // 中国大陆手机号格式：138 0013 8000
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  }
  
  return phone;
}

/**
 * 格式化身份证号（隐藏中间部分）
 * @param idCard 身份证号
 * @returns 格式化后的身份证号
 */
export function formatIdCard(idCard: string): string {
  if (idCard.length === 18) {
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  }
  
  if (idCard.length === 15) {
    return idCard.replace(/(\d{6})\d{6}(\d{3})/, '$1******$2');
  }
  
  return idCard;
}

/**
 * 格式化银行卡号（添加空格分隔）
 * @param cardNumber 银行卡号
 * @returns 格式化后的银行卡号
 */
export function formatBankCard(cardNumber: string): string {
  // 移除所有非数字字符
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // 每4位添加一个空格
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * 隐藏银行卡号中间部分
 * @param cardNumber 银行卡号
 * @returns 隐藏后的银行卡号
 */
export function maskBankCard(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (cleaned.length >= 8) {
    const first = cleaned.slice(0, 4);
    const last = cleaned.slice(-4);
    const middle = '*'.repeat(cleaned.length - 8);
    return `${first} ${middle} ${last}`;
  }
  
  return cardNumber;
}

/**
 * 格式化邮箱（隐藏用户名部分）
 * @param email 邮箱地址
 * @returns 隐藏后的邮箱
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  
  if (!username || !domain) {
    return email;
  }
  
  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }
  
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
  return `${maskedUsername}@${domain}`;
}

/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 驼峰命名转换为短横线命名
 * @param str 驼峰命名字符串
 * @returns 短横线命名字符串
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 短横线命名转换为驼峰命名
 * @param str 短横线命名字符串
 * @returns 驼峰命名字符串
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 生成随机字符串
 * @param length 长度
 * @param chars 字符集，默认为字母和数字
 * @returns 随机字符串
 */
export function generateRandomString(
  length: number,
  chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}