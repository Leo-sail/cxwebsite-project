import React from 'react';

interface ContentRendererProps {
  /** 页面ID */
  pageId: string;
  /** 是否为编辑模式 */
  isEditMode?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 内容渲染器组件
 * 注意：相关的数据表已被删除，此组件暂时不可用
 */
export const ContentRenderer: React.FC<ContentRendererProps> = ({
  pageId,
  isEditMode = false,
  className = ''
}) => {
  return (
    <div className={`content-renderer ${className}`}>
      <div className="empty-state">
        <h3>内容渲染器暂时不可用</h3>
        <p>相关数据表已被删除，无法渲染页面内容 (页面ID: {pageId})</p>
        {isEditMode && (
          <p>编辑模式已禁用</p>
        )}
      </div>
    </div>
  );
};

// 添加基本样式
const styles = `
.content-renderer {
  width: 100%;
  min-height: 200px;
}

.content-renderer.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1rem;
}
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default ContentRenderer;