import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  UserGroupIcon,
  DocumentTextIcon,
  NewspaperIcon,
  ChartBarIcon,
  ArrowDownIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils';
import { useTheme } from '../../hooks/useTheme';
import { statsApi } from '../../services/api';

/**
 * 统计卡片数据类型
 */
interface StatCardProps {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/**
 * 统计卡片组件
 */
const StatCard: React.FC<StatCardProps> = ({ name, value, change, changeType, icon: Icon }) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme?.colors?.background === '#000000' || currentTheme?.colors?.background === '#1a1a1a' || currentTheme?.colors?.text === '#ffffff';
  
  return (
    <div className={`overflow-hidden shadow-lg rounded-xl transition-all duration-200 hover:shadow-xl hover:scale-105 ${
      isDark
        ? 'bg-gray-800 border border-gray-700'
        : 'bg-white border border-gray-100'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <dl>
              <dt className={`text-sm font-medium truncate ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>{name}</dt>
              <dd className="mt-1">
                <div className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{value}</div>
              </dd>
            </dl>
          </div>
          <div className={`flex-shrink-0 p-3 rounded-xl ${
            isDark
              ? 'bg-blue-900/50'
              : 'bg-gradient-to-br from-blue-50 to-blue-100'
          }`}>
            <Icon className={`h-6 w-6 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className={`px-6 py-3 border-t ${
        isDark
          ? 'bg-gray-700/50 border-gray-600'
          : 'bg-gray-50 border-gray-100'
      }`}>
        <div className="flex items-center justify-between text-sm">
          <span className={`inline-flex items-center font-medium ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <ArrowTrendingUpIcon className="flex-shrink-0 mr-1 h-4 w-4" aria-hidden="true" />
            ) : (
              <ArrowDownIcon className="flex-shrink-0 mr-1 h-4 w-4" aria-hidden="true" />
            )}
            {change}
          </span>
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            较上月
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * 最近活动项类型
 */
interface ActivityItem {
  id: string;
  type: 'course' | 'teacher' | 'case' | 'article';
  title: string;
  description: string;
  time: string;
  status: 'published' | 'draft' | 'pending';
}

/**
 * 活动列表组件
 */
const ActivityList: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme?.colors?.background === '#000000' || currentTheme?.colors?.background === '#1a1a1a' || currentTheme?.colors?.text === '#ffffff';
  
  const getStatusColor = (status: ActivityItem['status']) => {
    if (isDark) {
      switch (status) {
        case 'published':
          return 'bg-green-900/50 text-green-400 border-green-800';
        case 'draft':
          return 'bg-yellow-900/50 text-yellow-400 border-yellow-800';
        case 'pending':
          return 'bg-blue-900/50 text-blue-400 border-blue-800';
        default:
          return 'bg-gray-700 text-gray-300 border-gray-600';
      }
    } else {
      switch (status) {
        case 'published':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'draft':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'pending':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getStatusText = (status: ActivityItem['status']) => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'draft':
        return '草稿';
      case 'pending':
        return '待审核';
      default:
        return '未知';
    }
  };

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'course':
        return AcademicCapIcon;
      case 'teacher':
        return UserGroupIcon;
      case 'case':
        return DocumentTextIcon;
      case 'article':
        return NewspaperIcon;
      default:
        return DocumentTextIcon;
    }
  };

  return (
    <div className={`shadow-lg rounded-xl transition-colors duration-200 ${
      isDark
        ? 'bg-gray-800 border border-gray-700'
        : 'bg-white border border-gray-100'
    }`}>
      <div className="px-6 py-5">
        <h3 className={`text-lg leading-6 font-semibold mb-4 flex items-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <SparklesIcon className="w-5 h-5 mr-2 text-blue-500" />
          最近活动
        </h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => {
              const Icon = getTypeIcon(activity.type);
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                          isDark ? 'bg-gray-600' : 'bg-gray-200'
                        }`}
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-4 ${
                          isDark ? 'ring-gray-800' : 'ring-white'
                        } shadow-lg`}>
                          <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <span className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>{activity.title}</span>
                          </p>
                          <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>{activity.description}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap">
                          <div className="mb-1">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                                getStatusColor(activity.status)
                              )}
                            >
                              {getStatusText(activity.status)}
                            </span>
                          </div>
                          <time dateTime={activity.time} className={isDark ? 'text-gray-400' : 'text-gray-500'}>{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * 管理后台仪表盘页面
 */
const Dashboard: React.FC = () => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme?.colors?.background === '#000000' || currentTheme?.colors?.background === '#1a1a1a' || currentTheme?.colors?.text === '#ffffff';
  const [stats, setStats] = useState([
    {
      name: '总课程数',
      value: '0',
      change: '+0%',
      changeType: 'increase' as const,
      icon: AcademicCapIcon,
    },
    {
      name: '师资人数',
      value: '0',
      change: '+0%',
      changeType: 'increase' as const,
      icon: UserGroupIcon,
    },
    {
      name: '学员案例',
      value: '0',
      change: '+0%',
      changeType: 'increase' as const,
      icon: DocumentTextIcon,
    },
    {
      name: '文章数量',
      value: '0',
      change: '+0%',
      changeType: 'increase' as const,
      icon: NewspaperIcon,
    },
  ]);
  
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  /**
   * 加载统计数据
   */
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsApi.getDashboardStats();
      if (data) {
        setStats([
          {
            name: '总课程数',
            value: data.courses.toString(),
            change: '+12%',
            changeType: 'increase' as const,
            icon: AcademicCapIcon,
          },
          {
            name: '师资人数',
            value: data.teachers.toString(),
            change: '+5%',
            changeType: 'increase' as const,
            icon: UserGroupIcon,
          },
          {
            name: '学员案例',
            value: data.studentCases.toString(),
            change: '+23%',
            changeType: 'increase' as const,
            icon: DocumentTextIcon,
          },
          {
            name: '文章数量',
            value: data.articles.toString(),
            change: '+8%',
            changeType: 'increase' as const,
            icon: NewspaperIcon,
          },
        ]);
      }
    } catch (error: unknown) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载最近活动数据
   */
  const loadRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const data = await statsApi.getRecentActivities(10);
      if (data) {
        // 为API数据添加默认的status字段，确保符合ActivityItem接口
        const activitiesWithStatus: ActivityItem[] = data.map((item: Record<string, unknown>) => ({
          id: (item.id as string) || '',
          type: (item.type as ActivityItem['type']) || 'article',
          title: (item.title as string) || '',
          description: (item.description as string) || '',
          time: (item.time as string) || new Date().toISOString(),
          status: (item.status as ActivityItem['status']) || 'published'
        }));
        setRecentActivities(activitiesWithStatus);
      }
    } catch (error: unknown) {
      console.error('加载活动数据失败:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadRecentActivities();
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className={`p-6 rounded-xl transition-colors duration-200 ${
        isDark
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
      }`}>
        <h1 className={`text-3xl font-bold flex items-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <ChartBarIcon className="w-8 h-8 mr-3 text-blue-500" />
          仪表盘
        </h1>
        <p className={`mt-2 text-sm ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          欢迎回来，这里是您的管理概览
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      {/* 图表和活动区域 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 访问统计图表占位 */}
        <div className={`shadow-lg rounded-xl transition-colors duration-200 ${
          isDark
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-100'
        }`}>
          <div className="px-6 py-5">
            <h3 className={`text-lg leading-6 font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <ChartBarIcon className="w-5 h-5 mr-2 text-blue-500" />
              访问统计
            </h3>
            <div className={`h-64 flex items-center justify-center rounded-xl transition-colors duration-200 ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="text-center">
                <ChartBarIcon className={`mx-auto h-12 w-12 ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <p className={`mt-2 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  图表组件待实现
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 最近活动 */}
        {activitiesLoading ? (
          <div className={`shadow-lg rounded-xl transition-colors duration-200 ${
            isDark
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-100'
          }`}>
            <div className="px-6 py-5">
              <div className="animate-pulse">
                <div className={`h-4 rounded mb-4 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
                <div className="space-y-3">
                  <div className={`h-3 rounded ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-3 rounded ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-3 rounded ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ActivityList activities={recentActivities} />
        )}
      </div>

      {/* 快速操作 */}
      <div className={`shadow-lg rounded-xl transition-colors duration-200 ${
        isDark
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-100'
      }`}>
        <div className="px-6 py-5">
          <h3 className={`text-lg leading-6 font-semibold mb-4 flex items-center ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            <SparklesIcon className="w-5 h-5 mr-2 text-blue-500" />
            快速操作
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-blue-900/50 hover:bg-blue-800/50 border border-blue-800'
                : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
            }`}>
              <AcademicCapIcon className={`h-8 w-8 mx-auto mb-2 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <p className={`text-sm font-medium ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>添加课程</p>
            </button>
            <button className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-green-900/50 hover:bg-green-800/50 border border-green-800'
                : 'bg-green-50 hover:bg-green-100 border border-green-200'
            }`}>
              <UserGroupIcon className={`h-8 w-8 mx-auto mb-2 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
              <p className={`text-sm font-medium ${
                isDark ? 'text-green-300' : 'text-green-700'
              }`}>添加讲师</p>
            </button>
            <button className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-purple-900/50 hover:bg-purple-800/50 border border-purple-800'
                : 'bg-purple-50 hover:bg-purple-100 border border-purple-200'
            }`}>
              <DocumentTextIcon className={`h-8 w-8 mx-auto mb-2 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <p className={`text-sm font-medium ${
                isDark ? 'text-purple-300' : 'text-purple-700'
              }`}>添加案例</p>
            </button>
            <button className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-orange-900/50 hover:bg-orange-800/50 border border-orange-800'
                : 'bg-orange-50 hover:bg-orange-100 border border-orange-200'
            }`}>
              <NewspaperIcon className={`h-8 w-8 mx-auto mb-2 ${
                isDark ? 'text-orange-400' : 'text-orange-600'
              }`} />
              <p className={`text-sm font-medium ${
                isDark ? 'text-orange-300' : 'text-orange-700'
              }`}>发布文章</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;