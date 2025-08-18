# 信息管理重构 - 智能决策策略文档

## 关键设计决策

### 1. 编辑器类型决策

**决策**: 使用结构化表单编辑器

**理由**:
- 现有项目已有完善的表单组件体系
- 结构化数据便于前端页面渲染
- 更好的数据验证和类型安全
- 符合现有site_content表的字段结构
- 降低XSS安全风险

**实现方案**:
- 每个页面分为多个可编辑区域（标题、描述、按钮文本等）
- 使用现有的表单组件和验证机制
- 支持基本的文本格式（如换行、链接）

### 2. 内容结构设计

**决策**: 基于现有site_content表结构，为每个页面定义标准化内容字段

#### 首页内容字段
```typescript
interface HomePageContent {
  hero_title: string;           // 主标题
  hero_description: string;     // 主描述
  hero_button_text: string;     // 主按钮文本
  courses_title: string;        // 课程区域标题
  courses_description: string;  // 课程区域描述
  teachers_title: string;       // 师资区域标题
  teachers_description: string; // 师资区域描述
  cases_title: string;          // 案例区域标题
  cases_description: string;    // 案例区域描述
  articles_title: string;       // 文章区域标题
  articles_description: string; // 文章区域描述
}
```

#### 关于我们页面字段
```typescript
interface AboutPageContent {
  page_title: string;           // 页面标题
  page_description: string;     // 页面描述
  intro_title: string;          // 介绍标题
  intro_content: string;        // 介绍内容
  mission_title: string;        // 使命标题
  mission_content: string;      // 使命内容
  vision_title: string;         // 愿景标题
  vision_content: string;       // 愿景内容
  values_title: string;         // 价值观标题
  values_content: string;       // 价值观内容
}
```

#### 联系我们页面字段
```typescript
interface ContactPageContent {
  page_title: string;           // 页面标题
  page_description: string;     // 页面描述
  contact_title: string;        // 联系标题
  contact_subtitle: string;     // 联系副标题
  address_title: string;        // 地址标题
  address_content: string;      // 地址内容
  phone_title: string;          // 电话标题
  phone_content: string;        // 电话内容
  email_title: string;          // 邮箱标题
  email_content: string;        // 邮箱内容
  form_title: string;           // 表单标题
  form_description: string;     // 表单描述
}
```

### 3. 预览功能决策

**决策**: 实现简单的预览功能

**理由**:
- 提升用户体验
- 降低编辑错误率
- 技术实现相对简单

**实现方案**:
- 在编辑界面右侧提供预览面板
- 实时显示编辑内容的效果
- 使用现有页面组件进行预览渲染

### 4. 版本控制决策

**决策**: 暂不实现版本控制

**理由**:
- 当前需求未明确要求
- 增加系统复杂度
- 可在后续版本中添加

**备选方案**: 在site_content表中保留created_at和updated_at字段用于基础审计

### 5. 权限控制决策

**决策**: 复用现有的管理员权限体系

**理由**:
- 现有项目已有完善的权限控制
- 避免重复开发
- 保持系统一致性

## 数据库设计

### 表结构设计

**使用现有site_content表**，通过以下字段组织数据：

```sql
-- 现有表结构（无需修改）
CREATE TABLE site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key varchar NOT NULL,        -- 内容键（如 'hero_title', 'about_intro'）
  content_type varchar NOT NULL,       -- 内容类型（'text', 'html', 'json'）
  title text,                          -- 显示标题
  content text NOT NULL,               -- 实际内容
  description text,                    -- 内容描述
  page_location varchar NOT NULL,      -- 页面位置（'home', 'about', 'contact'）
  component_type varchar,              -- 组件类型
  display_order integer DEFAULT 0,    -- 显示顺序
  is_active boolean DEFAULT true,     -- 是否激活
  metadata jsonb,                      -- 元数据
  created_at timestamp DEFAULT now(), -- 创建时间
  updated_at timestamp DEFAULT now()  -- 更新时间
);
```

### 数据组织策略

#### 页面内容映射
```typescript
// 页面位置枚举
enum PageLocation {
  HOME = 'home',
  ABOUT = 'about', 
  CONTACT = 'contact'
}

// 内容键映射
const CONTENT_KEYS = {
  // 首页内容键
  HOME: {
    HERO_TITLE: 'hero_title',
    HERO_DESCRIPTION: 'hero_description',
    HERO_BUTTON_TEXT: 'hero_button_text',
    COURSES_TITLE: 'courses_title',
    COURSES_DESCRIPTION: 'courses_description',
    TEACHERS_TITLE: 'teachers_title',
    TEACHERS_DESCRIPTION: 'teachers_description',
    CASES_TITLE: 'cases_title',
    CASES_DESCRIPTION: 'cases_description',
    ARTICLES_TITLE: 'articles_title',
    ARTICLES_DESCRIPTION: 'articles_description'
  },
  // 关于我们内容键
  ABOUT: {
    PAGE_TITLE: 'page_title',
    PAGE_DESCRIPTION: 'page_description',
    INTRO_TITLE: 'intro_title',
    INTRO_CONTENT: 'intro_content',
    MISSION_TITLE: 'mission_title',
    MISSION_CONTENT: 'mission_content',
    VISION_TITLE: 'vision_title',
    VISION_CONTENT: 'vision_content',
    VALUES_TITLE: 'values_title',
    VALUES_CONTENT: 'values_content'
  },
  // 联系我们内容键
  CONTACT: {
    PAGE_TITLE: 'page_title',
    PAGE_DESCRIPTION: 'page_description',
    CONTACT_TITLE: 'contact_title',
    CONTACT_SUBTITLE: 'contact_subtitle',
    ADDRESS_TITLE: 'address_title',
    ADDRESS_CONTENT: 'address_content',
    PHONE_TITLE: 'phone_title',
    PHONE_CONTENT: 'phone_content',
    EMAIL_TITLE: 'email_title',
    EMAIL_CONTENT: 'email_content',
    FORM_TITLE: 'form_title',
    FORM_DESCRIPTION: 'form_description'
  }
};
```

## API接口设计

### 1. 获取页面内容接口

```typescript
// GET /api/content/{page_location}
interface GetPageContentRequest {
  page_location: 'home' | 'about' | 'contact';
}

interface GetPageContentResponse {
  success: boolean;
  data: {
    [content_key: string]: {
      id: string;
      content: string;
      title?: string;
      description?: string;
      updated_at: string;
    }
  };
  error?: string;
}
```

### 2. 更新页面内容接口

```typescript
// PUT /api/content/{page_location}
interface UpdatePageContentRequest {
  page_location: 'home' | 'about' | 'contact';
  content: {
    [content_key: string]: {
      content: string;
      title?: string;
      description?: string;
    }
  };
}

interface UpdatePageContentResponse {
  success: boolean;
  data?: {
    updated_count: number;
    updated_items: string[];
  };
  error?: string;
}
```

### 3. 批量更新接口

```typescript
// PUT /api/content/batch
interface BatchUpdateContentRequest {
  updates: Array<{
    id?: string;
    content_key: string;
    page_location: string;
    content: string;
    title?: string;
    description?: string;
  }>;
}

interface BatchUpdateContentResponse {
  success: boolean;
  data?: {
    created_count: number;
    updated_count: number;
    failed_count: number;
    results: Array<{
      content_key: string;
      status: 'created' | 'updated' | 'failed';
      id?: string;
      error?: string;
    }>;
  };
  error?: string;
}
```

## 服务层设计

### 扩展现有contentSettingsService

```typescript
// 新增页面内容管理服务
class PageContentService {
  /**
   * 获取指定页面的所有内容
   */
  async getPageContent(pageLocation: PageLocation): Promise<PageContentData> {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('page_location', pageLocation)
      .eq('is_active', true)
      .order('display_order');
    
    if (error) throw error;
    
    // 转换为键值对格式
    return data.reduce((acc, item) => {
      acc[item.content_key] = {
        id: item.id,
        content: item.content,
        title: item.title,
        description: item.description,
        updated_at: item.updated_at
      };
      return acc;
    }, {} as PageContentData);
  }

  /**
   * 更新页面内容
   */
  async updatePageContent(
    pageLocation: PageLocation, 
    contentUpdates: ContentUpdateData
  ): Promise<UpdateResult> {
    const updates = Object.entries(contentUpdates).map(([key, value]) => ({
      content_key: key,
      page_location: pageLocation,
      content: value.content,
      title: value.title,
      description: value.description,
      updated_at: new Date().toISOString()
    }));

    // 使用upsert进行批量更新或插入
    const { data, error } = await supabase
      .from('site_content')
      .upsert(updates, {
        onConflict: 'content_key,page_location'
      })
      .select();

    if (error) throw error;
    
    return {
      success: true,
      updated_count: data.length,
      updated_items: data.map(item => item.content_key)
    };
  }

  /**
   * 初始化页面默认内容
   */
  async initializePageDefaults(pageLocation: PageLocation): Promise<void> {
    const defaultContent = this.getDefaultContent(pageLocation);
    await this.updatePageContent(pageLocation, defaultContent);
  }

  /**
   * 获取页面默认内容
   */
  private getDefaultContent(pageLocation: PageLocation): ContentUpdateData {
    // 根据页面返回默认内容配置
    switch (pageLocation) {
      case PageLocation.HOME:
        return DEFAULT_HOME_CONTENT;
      case PageLocation.ABOUT:
        return DEFAULT_ABOUT_CONTENT;
      case PageLocation.CONTACT:
        return DEFAULT_CONTACT_CONTENT;
      default:
        return {};
    }
  }
}
```

## 组件架构设计

### 1. 主容器组件

```typescript
// InfoManagementContainer.tsx
interface InfoManagementContainerProps {
  // 继承现有容器组件的通用属性
}

// 组件职责：
// - 管理页面状态（当前编辑页面、加载状态等）
// - 协调子组件交互
// - 处理数据保存和错误处理
```

### 2. 页面选择组件

```typescript
// PageSelector.tsx
interface PageSelectorProps {
  currentPage: PageLocation;
  onPageChange: (page: PageLocation) => void;
  hasUnsavedChanges: boolean;
}

// 组件职责：
// - 提供页面切换功能
// - 显示未保存更改警告
// - 页面状态指示
```

### 3. 内容编辑组件

```typescript
// ContentEditor.tsx
interface ContentEditorProps {
  pageLocation: PageLocation;
  content: PageContentData;
  onContentChange: (updates: Partial<PageContentData>) => void;
  isLoading: boolean;
}

// 组件职责：
// - 渲染页面特定的编辑表单
// - 处理表单验证
// - 实时内容更新
```

### 4. 预览组件

```typescript
// ContentPreview.tsx
interface ContentPreviewProps {
  pageLocation: PageLocation;
  content: PageContentData;
  isVisible: boolean;
}

// 组件职责：
// - 实时预览编辑内容
// - 模拟前端页面显示效果
// - 响应式预览
```

## 数据流设计

### 1. 数据获取流程
```
用户选择页面 → 调用getPageContent API → 从Supabase获取数据 → 更新组件状态 → 渲染编辑表单
```

### 2. 数据保存流程
```
用户编辑内容 → 表单验证 → 调用updatePageContent API → 保存到Supabase → 更新本地状态 → 显示成功提示
```

### 3. 前端数据同步流程
```
后台保存内容 → Supabase数据更新 → 前端页面调用API → 获取最新数据 → 重新渲染页面
```

## 错误处理策略

### 1. API错误处理
- 网络错误：显示重试选项
- 验证错误：显示具体字段错误信息
- 权限错误：重定向到登录页面
- 服务器错误：显示通用错误信息

### 2. 数据一致性保证
- 使用乐观锁防止并发编辑冲突
- 定期检查数据同步状态
- 提供数据恢复机制

### 3. 用户体验优化
- 自动保存草稿功能
- 离线编辑支持
- 操作撤销功能

## 性能优化策略

### 1. 数据加载优化
- 按需加载页面内容
- 实现数据缓存机制
- 使用React.memo优化组件渲染

### 2. 编辑体验优化
- 防抖处理用户输入
- 批量提交编辑更改
- 预加载相关数据

### 3. 预览性能优化
- 虚拟化长内容预览
- 延迟加载预览组件
- 缓存预览渲染结果

---

**文档版本**: 1.0  
**创建时间**: 2025-01-17  
**最后更新**: 2025-01-17  
**状态**: 已完成