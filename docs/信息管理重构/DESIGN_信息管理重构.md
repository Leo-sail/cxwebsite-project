# 信息管理重构 - 系统设计文档

## 整体架构设计

### 系统架构图

```mermaid
graph TB
    subgraph "前端层 (Frontend Layer)"
        A[用户界面 UI]
        B[路由管理 Router]
        C[状态管理 State]
        D[组件库 Components]
    end
    
    subgraph "业务层 (Business Layer)"
        E[信息管理容器 InfoManagementContainer]
        F[页面选择器 PageSelector]
        G[内容编辑器 ContentEditor]
        H[内容预览 ContentPreview]
        I[操作栏 ActionBar]
    end
    
    subgraph "服务层 (Service Layer)"
        J[页面内容服务 PageContentService]
        K[数据验证服务 ValidationService]
        L[缓存管理服务 CacheService]
        M[错误处理服务 ErrorService]
    end
    
    subgraph "数据层 (Data Layer)"
        N[Supabase客户端 SupabaseClient]
        O[site_content表]
        P[RLS策略 Row Level Security]
    end
    
    subgraph "前端网站 (Public Website)"
        Q[首页 HomePage]
        R[关于我们 AboutPage]
        S[联系我们 ContactPage]
        T[内容获取服务 ContentFetchService]
    end

    A --> B
    B --> E
    E --> F
    E --> G
    E --> H
    E --> I
    
    F --> J
    G --> J
    G --> K
    H --> J
    I --> J
    
    J --> L
    J --> M
    J --> N
    K --> M
    
    N --> O
    N --> P
    
    Q --> T
    R --> T
    S --> T
    T --> N
    
    style E fill:#e1f5fe
    style J fill:#f3e5f5
    style N fill:#e8f5e8
    style O fill:#fff3e0
```

### 分层设计说明

#### 1. 前端层 (Frontend Layer)
- **用户界面**: 基于React组件的响应式界面
- **路由管理**: 使用React Router进行页面导航
- **状态管理**: 使用React Hooks管理组件状态
- **组件库**: 复用现有Tailwind CSS组件

#### 2. 业务层 (Business Layer)
- **信息管理容器**: 主要的业务逻辑协调器
- **页面选择器**: 处理页面切换逻辑
- **内容编辑器**: 管理表单编辑和验证
- **内容预览**: 实时预览编辑效果
- **操作栏**: 处理保存、重置等操作

#### 3. 服务层 (Service Layer)
- **页面内容服务**: 核心数据操作服务
- **数据验证服务**: 输入验证和数据清理
- **缓存管理服务**: 优化数据加载性能
- **错误处理服务**: 统一错误处理和用户反馈

#### 4. 数据层 (Data Layer)
- **Supabase客户端**: 数据库连接和操作
- **site_content表**: 核心数据存储
- **RLS策略**: 数据安全和权限控制

## 核心组件设计

### 1. 信息管理容器 (InfoManagementContainer)

```mermaid
graph TD
    A[InfoManagementContainer] --> B[状态管理]
    A --> C[数据加载]
    A --> D[错误处理]
    A --> E[子组件协调]
    
    B --> B1[当前页面状态]
    B --> B2[编辑内容状态]
    B --> B3[加载状态]
    B --> B4[错误状态]
    
    C --> C1[页面内容获取]
    C --> C2[默认数据初始化]
    C --> C3[数据缓存管理]
    
    D --> D1[API错误处理]
    D --> D2[验证错误处理]
    D --> D3[网络错误处理]
    
    E --> E1[页面选择器]
    E --> E2[内容编辑器]
    E --> E3[内容预览]
    E --> E4[操作栏]
```

#### 组件接口设计

```typescript
interface InfoManagementContainerProps {
  // 继承现有容器组件属性
}

interface InfoManagementState {
  currentPage: PageLocation;
  content: Record<PageLocation, PageContentData>;
  editingContent: PageContentData;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
  previewMode: boolean;
}

interface InfoManagementActions {
  setCurrentPage: (page: PageLocation) => void;
  updateContent: (updates: Partial<PageContentData>) => void;
  saveContent: () => Promise<void>;
  resetContent: () => void;
  togglePreview: () => void;
  clearError: () => void;
}
```

### 2. 页面选择器 (PageSelector)

```mermaid
graph LR
    A[PageSelector] --> B[首页标签]
    A --> C[关于我们标签]
    A --> D[联系我们标签]
    
    B --> E[状态指示器]
    C --> F[状态指示器]
    D --> G[状态指示器]
    
    E --> H[已保存/未保存]
    F --> I[已保存/未保存]
    G --> J[已保存/未保存]
```

#### 组件接口设计

```typescript
interface PageSelectorProps {
  currentPage: PageLocation;
  onPageChange: (page: PageLocation) => void;
  pageStates: Record<PageLocation, PageState>;
  disabled?: boolean;
}

interface PageState {
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  hasError: boolean;
  lastSaved?: Date;
}

enum PageLocation {
  HOME = 'home',
  ABOUT = 'about',
  CONTACT = 'contact'
}
```

### 3. 内容编辑器 (ContentEditor)

```mermaid
graph TD
    A[ContentEditor] --> B[表单渲染器]
    A --> C[验证管理器]
    A --> D[实时更新器]
    
    B --> B1[首页表单 HomePageForm]
    B --> B2[关于页表单 AboutPageForm]
    B --> B3[联系页表单 ContactPageForm]
    
    C --> C1[字段验证]
    C --> C2[表单验证]
    C --> C3[错误显示]
    
    D --> D1[防抖处理]
    D --> D2[状态同步]
    D --> D3[预览更新]
```

#### 表单组件设计

```typescript
// 首页编辑表单
interface HomePageFormProps {
  content: HomePageContent;
  onChange: (updates: Partial<HomePageContent>) => void;
  errors: ValidationErrors;
  isLoading: boolean;
}

// 关于我们编辑表单
interface AboutPageFormProps {
  content: AboutPageContent;
  onChange: (updates: Partial<AboutPageContent>) => void;
  errors: ValidationErrors;
  isLoading: boolean;
}

// 联系我们编辑表单
interface ContactPageFormProps {
  content: ContactPageContent;
  onChange: (updates: Partial<ContactPageContent>) => void;
  errors: ValidationErrors;
  isLoading: boolean;
}
```

### 4. 内容预览 (ContentPreview)

```mermaid
graph TD
    A[ContentPreview] --> B[预览渲染器]
    A --> C[响应式容器]
    A --> D[实时更新]
    
    B --> B1[首页预览 HomePreview]
    B --> B2[关于页预览 AboutPreview]
    B --> B3[联系页预览 ContactPreview]
    
    C --> C1[桌面视图]
    C --> C2[平板视图]
    C --> C3[移动视图]
    
    D --> D1[内容监听]
    D --> D2[DOM更新]
    D --> D3[样式应用]
```

## 数据流向设计

### 1. 数据获取流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant C as InfoManagementContainer
    participant S as PageContentService
    participant DB as Supabase
    
    U->>C: 选择页面
    C->>S: getPageContent(pageLocation)
    S->>DB: SELECT * FROM site_content WHERE page_location = ?
    DB-->>S: 返回页面内容数据
    S-->>C: 返回格式化的页面内容
    C->>C: 更新组件状态
    C->>U: 渲染编辑表单
```

### 2. 数据保存流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant C as InfoManagementContainer
    participant V as ValidationService
    participant S as PageContentService
    participant DB as Supabase
    
    U->>C: 点击保存
    C->>V: validateContent(content)
    V-->>C: 验证结果
    
    alt 验证通过
        C->>S: updatePageContent(pageLocation, content)
        S->>DB: UPSERT site_content
        DB-->>S: 返回更新结果
        S-->>C: 返回保存结果
        C->>U: 显示成功提示
    else 验证失败
        C->>U: 显示验证错误
    end
```

### 3. 前端同步流程

```mermaid
sequenceDiagram
    participant A as 后台管理
    participant DB as Supabase
    participant F as 前端网站
    participant U as 网站用户
    
    A->>DB: 保存内容更新
    DB-->>A: 确认保存成功
    
    U->>F: 访问页面
    F->>DB: 获取最新内容
    DB-->>F: 返回最新数据
    F->>U: 渲染最新内容
```

## 模块依赖关系

### 依赖关系图

```mermaid
graph TD
    A[InfoManagementContainer] --> B[PageSelector]
    A --> C[ContentEditor]
    A --> D[ContentPreview]
    A --> E[ActionBar]
    
    C --> F[HomePageForm]
    C --> G[AboutPageForm]
    C --> H[ContactPageForm]
    
    D --> I[HomePreview]
    D --> J[AboutPreview]
    D --> K[ContactPreview]
    
    A --> L[PageContentService]
    C --> M[ValidationService]
    A --> N[ErrorService]
    A --> O[CacheService]
    
    L --> P[SupabaseClient]
    M --> Q[ValidationRules]
    N --> R[ErrorMessages]
    O --> S[LocalStorage]
    
    style A fill:#ffeb3b
    style L fill:#4caf50
    style P fill:#2196f3
```

### 依赖层次说明

#### 第一层：容器组件
- `InfoManagementContainer`: 顶层容器，协调所有子组件

#### 第二层：功能组件
- `PageSelector`: 页面选择功能
- `ContentEditor`: 内容编辑功能
- `ContentPreview`: 内容预览功能
- `ActionBar`: 操作按钮功能

#### 第三层：专用组件
- 各页面的专用表单组件
- 各页面的专用预览组件

#### 第四层：服务层
- `PageContentService`: 数据操作服务
- `ValidationService`: 验证服务
- `ErrorService`: 错误处理服务
- `CacheService`: 缓存服务

#### 第五层：基础设施
- `SupabaseClient`: 数据库客户端
- `ValidationRules`: 验证规则
- `ErrorMessages`: 错误消息
- `LocalStorage`: 本地存储

## 接口契约定义

### 1. 页面内容数据接口

```typescript
// 基础内容项接口
interface ContentItem {
  id: string;
  content: string;
  title?: string;
  description?: string;
  updated_at: string;
}

// 页面内容数据接口
type PageContentData = Record<string, ContentItem>;

// 首页内容接口
interface HomePageContent {
  hero_title: ContentItem;
  hero_description: ContentItem;
  hero_button_text: ContentItem;
  courses_title: ContentItem;
  courses_description: ContentItem;
  teachers_title: ContentItem;
  teachers_description: ContentItem;
  cases_title: ContentItem;
  cases_description: ContentItem;
  articles_title: ContentItem;
  articles_description: ContentItem;
}

// 关于我们内容接口
interface AboutPageContent {
  page_title: ContentItem;
  page_description: ContentItem;
  intro_title: ContentItem;
  intro_content: ContentItem;
  mission_title: ContentItem;
  mission_content: ContentItem;
  vision_title: ContentItem;
  vision_content: ContentItem;
  values_title: ContentItem;
  values_content: ContentItem;
}

// 联系我们内容接口
interface ContactPageContent {
  page_title: ContentItem;
  page_description: ContentItem;
  contact_title: ContentItem;
  contact_subtitle: ContentItem;
  address_title: ContentItem;
  address_content: ContentItem;
  phone_title: ContentItem;
  phone_content: ContentItem;
  email_title: ContentItem;
  email_content: ContentItem;
  form_title: ContentItem;
  form_description: ContentItem;
}
```

### 2. API响应接口

```typescript
// 基础API响应接口
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 获取页面内容响应
interface GetPageContentResponse extends ApiResponse<PageContentData> {}

// 更新页面内容响应
interface UpdatePageContentResponse extends ApiResponse<{
  updated_count: number;
  updated_items: string[];
  failed_items?: Array<{
    content_key: string;
    error: string;
  }>;
}> {}

// 批量操作响应
interface BatchOperationResponse extends ApiResponse<{
  total_count: number;
  success_count: number;
  failed_count: number;
  results: Array<{
    content_key: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
}> {}
```

### 3. 验证接口

```typescript
// 验证错误接口
interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// 验证结果接口
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

// 验证规则接口
interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}
```

## 异常处理策略

### 异常处理流程

```mermaid
graph TD
    A[异常发生] --> B{异常类型}
    
    B -->|网络错误| C[NetworkError]
    B -->|验证错误| D[ValidationError]
    B -->|权限错误| E[AuthError]
    B -->|服务器错误| F[ServerError]
    B -->|未知错误| G[UnknownError]
    
    C --> H[显示重试选项]
    D --> I[显示字段错误]
    E --> J[重定向登录]
    F --> K[显示通用错误]
    G --> L[记录错误日志]
    
    H --> M[用户操作]
    I --> M
    J --> N[登录流程]
    K --> M
    L --> M
```

### 错误处理实现

```typescript
// 错误类型枚举
enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 错误处理服务
class ErrorService {
  /**
   * 处理API错误
   */
  handleApiError(error: any): ProcessedError {
    if (error.code === 'NETWORK_ERROR') {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: '网络连接失败，请检查网络后重试',
        action: 'retry'
      };
    }
    
    if (error.code === 'VALIDATION_ERROR') {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: '数据验证失败',
        details: error.details,
        action: 'fix_validation'
      };
    }
    
    // 其他错误类型处理...
  }
  
  /**
   * 显示错误消息
   */
  showError(error: ProcessedError): void {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        this.showNetworkErrorDialog(error);
        break;
      case ErrorType.VALIDATION_ERROR:
        this.showValidationErrors(error);
        break;
      // 其他错误显示处理...
    }
  }
}
```

## 性能优化设计

### 1. 数据加载优化

```mermaid
graph TD
    A[数据加载优化] --> B[懒加载策略]
    A --> C[缓存策略]
    A --> D[预加载策略]
    
    B --> B1[按需加载页面内容]
    B --> B2[延迟加载预览组件]
    B --> B3[虚拟化长列表]
    
    C --> C1[内存缓存]
    C --> C2[本地存储缓存]
    C --> C3[HTTP缓存]
    
    D --> D1[预加载相邻页面]
    D --> D2[预加载默认数据]
    D --> D3[预加载用户常用数据]
```

### 2. 渲染性能优化

```typescript
// 使用React.memo优化组件渲染
const ContentEditor = React.memo<ContentEditorProps>(({ 
  pageLocation, 
  content, 
  onChange, 
  isLoading 
}) => {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.pageLocation === nextProps.pageLocation &&
    prevProps.isLoading === nextProps.isLoading &&
    JSON.stringify(prevProps.content) === JSON.stringify(nextProps.content)
  );
});

// 使用useMemo优化计算
const processedContent = useMemo(() => {
  return processContentForDisplay(content);
}, [content]);

// 使用useCallback优化函数引用
const handleContentChange = useCallback((updates: Partial<PageContentData>) => {
  setContent(prev => ({ ...prev, ...updates }));
}, []);
```

### 3. 网络请求优化

```typescript
// 防抖处理用户输入
const debouncedSave = useMemo(
  () => debounce(async (content: PageContentData) => {
    try {
      await pageContentService.updatePageContent(currentPage, content);
      setHasUnsavedChanges(false);
    } catch (error) {
      errorService.handleError(error);
    }
  }, 1000),
  [currentPage]
);

// 批量请求优化
class PageContentService {
  private requestQueue: RequestItem[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  
  /**
   * 批量处理更新请求
   */
  private processBatchUpdates = async () => {
    if (this.requestQueue.length === 0) return;
    
    const batch = [...this.requestQueue];
    this.requestQueue = [];
    
    try {
      await this.batchUpdateContent(batch);
    } catch (error) {
      // 错误处理
    }
  };
}
```

---

**文档版本**: 1.0  
**创建时间**: 2025-01-17  
**最后更新**: 2025-01-17  
**状态**: 设计完成