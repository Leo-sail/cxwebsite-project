/**
 * 图片上传服务
 * 专门处理内容管理系统的图片上传功能
 */
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type MediaFile = Database['public']['Tables']['media_files']['Row'];
type MediaFileInsert = Database['public']['Tables']['media_files']['Insert'];

/**
 * 图片上传配置接口
 */
export interface ImageUploadConfig {
  maxSize?: number; // 最大文件大小（字节）
  allowedTypes?: string[]; // 允许的文件类型
  folder?: string; // 上传文件夹
  quality?: number; // 图片质量（0-1）
  maxWidth?: number; // 最大宽度
  maxHeight?: number; // 最大高度
}

/**
 * 图片上传结果接口
 */
export interface ImageUploadResult {
  id: string;
  url: string;
  filename: string;
  file_path: string;
  file_size: number;
  width?: number;
  height?: number;
  mime_type: string;
}

/**
 * 图片上传进度回调
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * 图片上传服务类
 */
export class ImageUploadService {
  private static readonly DEFAULT_CONFIG: Required<ImageUploadConfig> = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    folder: 'images',
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  };

  /**
   * 验证文件是否符合要求
   */
  private static validateFile(file: File, config: ImageUploadConfig): void {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    // 检查文件大小
    if (file.size > finalConfig.maxSize) {
      throw new Error(`文件大小不能超过 ${(finalConfig.maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // 检查文件类型
    if (!finalConfig.allowedTypes.includes(file.type)) {
      throw new Error(`不支持的文件类型: ${file.type}`);
    }
  }

  /**
   * 生成唯一文件名
   */
  private static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * 压缩图片
   */
  private static async compressImage(
    file: File,
    config: ImageUploadConfig
  ): Promise<File> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 计算新尺寸
        let { width, height } = img;
        const maxWidth = finalConfig.maxWidth;
        const maxHeight = finalConfig.maxHeight;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // 设置画布尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制图片
        ctx?.drawImage(img, 0, 0, width, height);

        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          file.type,
          finalConfig.quality
        );
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 获取图片尺寸
   */
  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error('无法获取图片尺寸'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 上传单个图片
   */
  static async uploadImage(
    file: File,
    config: ImageUploadConfig = {},
    onProgress?: UploadProgressCallback
  ): Promise<ImageUploadResult> {
    try {
      // 验证文件
      this.validateFile(file, config);
      onProgress?.(10);

      // 压缩图片
      const compressedFile = await this.compressImage(file, config);
      onProgress?.(30);

      // 获取图片尺寸
      const dimensions = await this.getImageDimensions(compressedFile);
      onProgress?.(40);

      // 生成文件路径
      const fileName = this.generateFileName(file.name);
      const folder = config.folder || this.DEFAULT_CONFIG.folder;
      const filePath = `${folder}/${fileName}`;

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`文件上传失败: ${uploadError.message}`);
      }
      onProgress?.(70);

      // 获取公共URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      onProgress?.(80);

      // 保存文件信息到数据库
      const mediaData: MediaFileInsert = {
        filename: fileName,
        file_path: filePath,
        file_type: 'image',
        file_size: compressedFile.size,
        mime_type: compressedFile.type,
        width: dimensions.width,
        height: dimensions.height,
        alt_text: file.name.split('.')[0] // 使用文件名作为默认alt文本
      };

      const { data: mediaFile, error: dbError } = await supabase
        .from('media_files')
        .insert(mediaData)
        .select()
        .single();

      if (dbError) {
        // 如果数据库保存失败，删除已上传的文件
        await supabase.storage.from('media').remove([filePath]);
        throw new Error(`保存文件信息失败: ${dbError.message}`);
      }

      onProgress?.(100);

      return {
        id: mediaFile.id,
        url: urlData.publicUrl,
        filename: mediaFile.filename,
        file_path: mediaFile.file_path,
        file_size: mediaFile.file_size,
        width: mediaFile.width || undefined,
        height: mediaFile.height || undefined,
        mime_type: mediaFile.mime_type || compressedFile.type
      };
    } catch (error) {
      console.error('图片上传失败:', error);
      throw error;
    }
  }

  /**
   * 批量上传图片
   */
  static async uploadMultipleImages(
    files: File[],
    config: ImageUploadConfig = {},
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadImage(
          file,
          config,
          (progress) => onProgress?.(i, progress)
        );
        results.push(result);
      } catch (error) {
        console.error(`上传第 ${i + 1} 个文件失败:`, error);
        throw error;
      }
    }
    
    return results;
  }

  /**
   * 删除图片
   */
  static async deleteImage(imageId: string): Promise<void> {
    try {
      // 获取文件信息
      const { data: mediaFile, error: fetchError } = await supabase
        .from('media_files')
        .select('file_path')
        .eq('id', imageId)
        .single();

      if (fetchError) {
        throw new Error(`获取文件信息失败: ${fetchError.message}`);
      }

      // 从存储中删除文件
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([mediaFile.file_path]);

      if (storageError) {
        console.warn('删除存储文件失败:', storageError.message);
      }

      // 从数据库中删除记录
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        throw new Error(`删除文件记录失败: ${dbError.message}`);
      }
    } catch (error) {
      console.error('删除图片失败:', error);
      throw error;
    }
  }

  /**
   * 获取图片列表
   */
  static async getImages(
    page: number = 1,
    limit: number = 20,
    fileType: string = 'image'
  ): Promise<{ data: MediaFile[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      // 获取总数
      const { count, error: countError } = await supabase
        .from('media_files')
        .select('*', { count: 'exact', head: true })
        .eq('file_type', fileType);

      if (countError) {
        throw new Error(`获取文件总数失败: ${countError.message}`);
      }

      // 获取分页数据
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('file_type', fileType)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`获取文件列表失败: ${error.message}`);
      }

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('获取图片列表失败:', error);
      throw error;
    }
  }

  /**
   * 更新图片信息
   */
  static async updateImageInfo(
    imageId: string,
    updates: { alt_text?: string; filename?: string }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('media_files')
        .update(updates)
        .eq('id', imageId);

      if (error) {
        throw new Error(`更新图片信息失败: ${error.message}`);
      }
    } catch (error) {
      console.error('更新图片信息失败:', error);
      throw error;
    }
  }
}

export default ImageUploadService;