import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import { componentTextApi } from '../../services/api';
import type { ComponentText, ComponentTextFormData } from '../../types/api';
import { Pencil, Plus, Trash2, Search, Filter } from 'lucide-react';

/**
 * 信息管理页面组件
 * 基于component_text_storage表实现文本内容的管理功能
 */
const ContentManagement: React.FC = () => {
  const [componentTexts, setComponentTexts] = useState<ComponentText[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [areas, setAreas] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ComponentText | null>(null);
  const [formData, setFormData] = useState<ComponentTextFormData>({
    key: '',
    area: null,
    content: '',
    description: null
  });

  /**
   * 加载所有文本内容
   */
  const loadComponentTexts = async () => {
    try {
      setLoading(true);
      const data = await componentTextApi.getAll();
      setComponentTexts(data);
      
      // 提取所有区域
      const uniqueAreas = Array.from(new Set(
        data.map(item => item.area).filter(Boolean)
      )) as string[];
      setAreas(uniqueAreas);
    } catch (error) {
      console.error('加载文本内容失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载文本内容，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 过滤文本内容
   */
  const filteredTexts = componentTexts.filter(item => {
    const matchesSearch = !searchTerm || 
      item.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesArea = selectedArea === 'all' || item.area === selectedArea;
    
    return matchesSearch && matchesArea;
  });

  /**
   * 按区域分组文本内容
   */
  const groupedTexts = filteredTexts.reduce((acc, item) => {
    const area = item.area || '未分类';
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(item);
    return acc;
  }, {} as Record<string, ComponentText[]>);

  /**
   * 打开编辑对话框
   */
  const openEditDialog = (item?: ComponentText) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        key: item.key,
        area: item.area,
        content: item.content,
        description: item.description
      });
    } else {
      setEditingItem(null);
      setFormData({
        key: '',
        area: null,
        content: '',
        description: null
      });
    }
    setIsEditDialogOpen(true);
  };

  /**
   * 保存文本内容
   */
  const handleSave = async () => {
    try {
      if (editingItem) {
        // 更新现有项
        await componentTextApi.update(editingItem.id, formData);
        toast({
          title: '更新成功',
          description: '文本内容已更新'
        });
      } else {
        // 创建新项
        await componentTextApi.create(formData);
        toast({
          title: '创建成功',
          description: '新文本内容已创建'
        });
      }
      
      setIsEditDialogOpen(false);
      loadComponentTexts();
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: '保存失败',
        description: '无法保存文本内容，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  /**
   * 删除文本内容
   */
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个文本内容吗？')) {
      return;
    }
    
    try {
      await componentTextApi.delete(id);
      toast({
        title: '删除成功',
        description: '文本内容已删除'
      });
      loadComponentTexts();
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除文本内容，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadComponentTexts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">信息管理</h1>
        <Button onClick={() => openEditDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          添加文本内容
        </Button>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索文本内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有区域</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{componentTexts.length}</div>
            <p className="text-gray-600">总文本数量</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{areas.length}</div>
            <p className="text-gray-600">区域数量</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredTexts.length}</div>
            <p className="text-gray-600">筛选结果</p>
          </CardContent>
        </Card>
      </div>

      {/* 文本内容列表 */}
      <div className="space-y-6">
        {Object.entries(groupedTexts).map(([area, texts]) => (
          <Card key={area}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">{area}</Badge>
                <span className="text-sm text-gray-500">({texts.length} 项)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {texts.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{item.key}</Badge>
                          {item.area && (
                            <Badge variant="outline">{item.area}</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-900 mb-2">
                          {item.content.length > 100 
                            ? `${item.content.substring(0, 100)}...` 
                            : item.content
                          }
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? '编辑文本内容' : '添加文本内容'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="key">标识符 (Key)</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="输入唯一标识符"
              />
            </div>
            <div>
              <Label htmlFor="area">区域</Label>
              <Input
                id="area"
                value={formData.area || ''}
                onChange={(e) => setFormData({ ...formData, area: e.target.value || null })}
                placeholder="输入区域名称"
              />
            </div>
            <div>
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="输入文本内容"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                placeholder="输入描述信息"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSave}>
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagement;