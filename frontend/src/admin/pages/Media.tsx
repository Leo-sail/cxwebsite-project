import React, { useState, useEffect, useCallback } from 'react';
import {
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  DocumentIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArrowDownTrayIcon,
  FolderIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import { DataTable, type Column } from '../../components';
import { FileUpload } from '../components';
import { MediaService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

/**
 * 媒体文件数据类型
 */
interface MediaFile extends Record<string, unknown> {
  id: string;
  filename: string;
  original_name: string;
  file_type: 'image' | 'video' | 'audio' | 'document' | 'other';
  mime_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  alt_text?: string;
  caption?: string;
  folder_path: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // 视频/音频时长（秒）
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * 媒体文件管理页面
 */
const Media: React.FC = () => {
  // 状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  /**
   * 加载媒体文件数据
   */
  const loadMediaFiles = useCallback(async () => {
    try {
      const data = await MediaService.getMediaFiles({
         search: searchTerm,
         fileType: selectedFileType === 'all' ? undefined : selectedFileType,
         folder: selectedFolder === 'all' ? undefined : selectedFolder,
       });
       // 映射数据库字段到MediaFile类型
         const mappedFiles = (data.data || []).map((file: Record<string, unknown>) => ({
           id: file.id as string,
           filename: file.filename as string,
           original_name: file.filename as string,
           mime_type: (file.file_type as string) || 'application/octet-stream',
           file_type: (file.file_type as 'image' | 'video' | 'audio' | 'document' | 'other') || 'other',
           file_size: (file.file_size as number) || 0,
           file_url: file.file_path as string,
           folder_path: '/uploads',
           alt_text: (file.alt_text as string) || '',
           uploaded_by: 'admin',
           created_at: (file.created_at as string) || new Date().toISOString(),
           updated_at: (file.created_at as string) || new Date().toISOString()
         }));
        setMediaFiles(mappedFiles);
    } catch (error: unknown) {
      console.error('加载媒体文件失败:', error);
      toast.error('加载媒体文件失败');
    }
  }, [searchTerm, selectedFileType, selectedFolder]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadMediaFiles();
  }, [loadMediaFiles]);

  // 搜索和筛选变化时重新加载数据
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMediaFiles();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadMediaFiles]);



  // 文件类型选项
  const fileTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'image', label: '图片' },
    { value: 'video', label: '视频' },
    { value: 'audio', label: '音频' },
    { value: 'document', label: '文档' },
    { value: 'other', label: '其他' },
  ];

  // 文件夹选项
  const folders = [
    { value: 'all', label: '全部文件夹' },
    { value: '/images', label: '图片文件夹' },
    { value: '/videos', label: '视频文件夹' },
    { value: '/audio', label: '音频文件夹' },
    { value: '/documents', label: '文档文件夹' },
  ];

  /**
   * 格式化文件大小
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * 格式化时长
   */
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * 获取文件类型图标
   */
  const getFileTypeIcon = (fileType: MediaFile['file_type']) => {
    switch (fileType) {
      case 'image':
        return <PhotoIcon className="h-5 w-5 text-green-500" />;
      case 'video':
        return <VideoCameraIcon className="h-5 w-5 text-blue-500" />;
      case 'audio':
        return <MusicalNoteIcon className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <DocumentIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // 由于已在API层面进行过滤，直接使用mediaFiles
  const filteredMediaFiles = mediaFiles;

  /**
   * 处理文件上传
   */
  const handleUploadFile = () => {
    setShowUploadModal(true);
  };

  /**
   * 处理上传成功
   */
  const handleUploadSuccess = () => {
    loadMediaFiles();
  };

  /**
   * 处理删除文件
   */
  const handleDeleteFile = async (fileId: string) => {
    try {
      await MediaService.deleteFile(fileId);
      toast.success('文件删除成功');
      loadMediaFiles();
    } catch (error: unknown) {
      console.error('删除文件失败:', error);
      toast.error('删除文件失败');
    }
  };

  /**
   * 处理查看文件
   */
  const handleViewFile = (fileUrl: string) => {
    console.log('查看文件:', fileUrl);
    window.open(fileUrl, '_blank');
  };

  /**
   * 处理下载文件
   */
  const handleDownloadFile = (fileUrl: string, filename: string) => {
    console.log('下载文件:', filename);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 网格视图渲染
  const renderGridView = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {filteredMediaFiles.map((file) => (
        <div key={file.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
            {file.file_type === 'image' && file.thumbnail_url && file.thumbnail_url.trim() !== '' ? (
              <img
                src={file.thumbnail_url}
                alt={file.alt_text}
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="flex h-32 items-center justify-center">
                {getFileTypeIcon(file.file_type)}
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 truncate" title={file.original_name}>
              {file.original_name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.file_size)}</p>
            {file.duration && (
              <p className="text-xs text-gray-500">{formatDuration(file.duration)}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleViewFile(file.file_url)}
                  className="text-blue-600 hover:text-blue-900"
                  title="查看"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownloadFile(file.file_url, file.filename)}
                  className="text-green-600 hover:text-green-900"
                  title="下载"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="text-red-600 hover:text-red-900"
                  title="删除"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // 表格列配置
  const columns: Column<MediaFile>[] = [
    {
      key: 'file_info',
      title: '文件信息',
      render: (_: unknown, file: MediaFile) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            {file.file_type === 'image' && file.thumbnail_url ? (
              <img
                src={file.thumbnail_url}
                alt={file.alt_text}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                {getFileTypeIcon(file.file_type)}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.original_name}>
              {file.original_name}
            </div>
            <div className="text-sm text-gray-500">{file.filename}</div>
            {file.caption && (
              <div className="text-xs text-gray-400 truncate max-w-xs">{file.caption}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'file_type',
      title: '类型',
      render: (_: unknown, file: MediaFile) => (
        <div className="flex items-center">
          {getFileTypeIcon(file.file_type)}
          <span className="ml-2 text-sm text-gray-900 capitalize">
            {file.file_type === 'image' ? '图片' :
             file.file_type === 'video' ? '视频' :
             file.file_type === 'audio' ? '音频' :
             file.file_type === 'document' ? '文档' : '其他'}
          </span>
        </div>
      ),
    },
    {
      key: 'file_size',
      title: '大小',
      render: (_: unknown, file: MediaFile) => (
        <div className="text-sm text-gray-900">
          {formatFileSize(file.file_size)}
        </div>
      ),
    },
    {
      key: 'dimensions',
      title: '尺寸/时长',
      render: (_: unknown, file: MediaFile) => (
        <div className="text-sm text-gray-900">
          {file.dimensions && (
            <div>{file.dimensions.width} × {file.dimensions.height}</div>
          )}
          {file.duration && (
            <div className="text-xs text-gray-500">{formatDuration(file.duration)}</div>
          )}
        </div>
      ),
    },
    {
      key: 'folder_path',
      title: '文件夹',
      render: (_: unknown, file: MediaFile) => (
        <div className="flex items-center text-sm text-gray-500">
          <FolderIcon className="h-4 w-4 mr-1" />
          {file.folder_path}
        </div>
      ),
    },
    {
      key: 'uploaded_by',
      title: '上传者',
      render: (_: unknown, file: MediaFile) => (
        <div className="text-sm text-gray-900">
          {file.uploaded_by}
        </div>
      ),
    },
    {
      key: 'created_at',
      title: '上传时间',
      render: (_: unknown, file: MediaFile) => (
        <div className="text-sm text-gray-500">
          {file.created_at}
        </div>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_: unknown, file: MediaFile) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewFile(file.file_url)}
            className="text-blue-600 hover:text-blue-900"
            title="查看"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDownloadFile(file.file_url, file.filename)}
            className="text-green-600 hover:text-green-900"
            title="下载"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteFile(file.id)}
            className="text-red-600 hover:text-red-900"
            title="删除"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">媒体文件</h1>
          <p className="mt-1 text-sm text-gray-500">管理网站的图片、视频、音频和文档等媒体文件</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
                viewMode === 'grid'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              )}
            >
              网格
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'relative inline-flex items-center px-3 py-2 rounded-r-md border-t border-r border-b text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500',
                viewMode === 'list'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              )}
            >
              列表
            </button>
          </div>
          <button
            onClick={handleUploadFile}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CloudArrowUpIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            上传文件
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* 搜索框 */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="搜索文件名、标题或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* 文件类型筛选 */}
            <div>
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {fileTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 文件夹筛选 */}
            <div>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {folders.map((folder) => (
                  <option key={folder.value} value={folder.value}>
                    {folder.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 媒体文件列表 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {viewMode === 'grid' ? (
            renderGridView()
          ) : (
            <DataTable
              data={filteredMediaFiles}
              columns={columns}
              empty="暂无媒体文件"
            />
          )}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">存储统计</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PhotoIcon className="h-6 w-6 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-blue-500 truncate">图片文件</dt>
                      <dd className="text-lg font-medium text-blue-900">
                        {mediaFiles.filter(f => f.file_type === 'image').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <VideoCameraIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-green-500 truncate">视频文件</dt>
                      <dd className="text-lg font-medium text-green-900">
                        {mediaFiles.filter(f => f.file_type === 'video').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-yellow-500 truncate">文档文件</dt>
                      <dd className="text-lg font-medium text-yellow-900">
                        {mediaFiles.filter(f => f.file_type === 'document').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FolderIcon className="h-6 w-6 text-purple-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-purple-500 truncate">总存储</dt>
                      <dd className="text-lg font-medium text-purple-900">
                        {formatFileSize(mediaFiles.reduce((sum, file) => sum + file.file_size, 0))}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 文件上传模态框 */}
      <FileUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        folder="uploads"
      />
    </div>
  );
};

export default Media;