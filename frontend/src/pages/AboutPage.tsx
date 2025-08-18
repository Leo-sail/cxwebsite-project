/**
 * 关于我们页面
 */
import React from 'react';
import { SEO, AnimatedContainer } from '../components';
import {
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  BookOpenIcon,
  StarIcon,
  TrophyIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

/**
 * 关于我们页面组件
 */
const AboutPage: React.FC = () => {
  return (
    <>
      <SEO
        title="关于我们 - 考研教育平台"
        description="了解我们的教育理念、师资团队和发展历程。专业的考研培训机构，助您实现名校梦想。"
        keywords="关于我们,教育理念,师资团队,考研培训机构,发展历程"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700">
          <div className="relative py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatedContainer className="text-center">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <HeartIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <StarIcon className="w-4 h-4 text-yellow-800" />
                    </div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                  关于我们
                  <span className="block text-xl md:text-2xl lg:text-3xl font-normal mt-3 text-white/90">
                    About Us
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-6 leading-relaxed">
                  专业的考研教育平台，致力于为每一位学员提供最优质的教学服务
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5" />
                    <span>专业教育</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5" />
                    <span>品质保证</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HeartIcon className="w-5 h-5" />
                    <span>用心服务</span>
                  </div>
                </div>
              </AnimatedContainer>
            </div>
          </div>
          
          {/* 装饰性元素 */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-1000"></div>
        </section>

        {/* 机构介绍 */}
        <section className="py-20 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <BookOpenIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-gray-900">我们的使命</h2>
                        <p className="text-blue-600 font-medium">Our Mission</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-l-4 border-blue-500">
                      <p className="font-medium text-gray-800 mb-2">专业教育机构</p>
                      <p>
                        我们是一家专注于考研教育的专业培训机构，成立于2015年。多年来，我们始终坚持"以学员为中心"的教育理念，
                        致力于为广大考研学子提供最专业、最有效的备考指导。
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                      <p className="font-medium text-gray-800 mb-2">个性化服务</p>
                      <p>
                        我们深知每一位学员的梦想都值得被认真对待，因此我们不断完善教学体系，优化课程内容，
                        确保每一位学员都能在这里找到适合自己的学习方法，实现自己的考研目标。
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-l-4 border-green-500">
                      <p className="font-medium text-gray-800 mb-2">卓越成果</p>
                      <p>
                        截至目前，我们已经帮助超过10000名学员成功考入理想院校，其中985、211院校录取率达到85%以上。
                        这些成绩的取得，离不开我们专业的师资团队和科学的教学方法。
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 z-10"></div>
                    <img
                      src="/images/about/teaching-environment.svg"
                      alt="教学环境"
                      className="w-full h-96 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  {/* 成就卡片 */}
                  <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">10000+</div>
                      <div className="text-blue-100 font-medium">成功学员</div>
                      <div className="flex justify-center mt-3">
                        <TrophyIcon className="w-6 h-6 text-yellow-300" />
                      </div>
                    </div>
                  </div>
                  
                  {/* 装饰元素 */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full opacity-80 animate-bounce"></div>
                  <div className="absolute top-1/4 -right-2 w-4 h-4 bg-pink-400 rounded-full opacity-60 animate-pulse"></div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
          
          {/* 背景装饰 */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-30 blur-3xl"></div>
        </section>

        {/* 核心优势 */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="text-center mb-16">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <StarIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">核心优势</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  我们的专业优势让每一位学员都能获得最优质的教学体验
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                {[
                  {
                    icon: <AcademicCapIcon className="h-8 w-8" />,
                    title: '专业师资',
                    description: '985/211名校毕业，平均教学经验8年以上',
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'from-blue-50 to-blue-100'
                  },
                  {
                    icon: <ChartBarIcon className="h-8 w-8" />,
                    title: '科学体系',
                    description: '完整的课程体系，从基础到冲刺全覆盖',
                    color: 'from-purple-500 to-purple-600',
                    bgColor: 'from-purple-50 to-purple-100'
                  },
                  {
                    icon: <UserGroupIcon className="h-8 w-8" />,
                    title: '个性化辅导',
                    description: '一对一答疑，针对性解决学习问题',
                    color: 'from-green-500 to-green-600',
                    bgColor: 'from-green-50 to-green-100'
                  },
                  {
                    icon: <CheckCircleIcon className="h-8 w-8" />,
                    title: '高通过率',
                    description: '985/211院校录取率85%，远超行业平均水平',
                    color: 'from-orange-500 to-orange-600',
                    bgColor: 'from-orange-50 to-orange-100'
                  }
                ].map((advantage, index) => (
                  <div key={index} className="group">
                    <div className={`bg-gradient-to-br ${advantage.bgColor} p-8 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/50 backdrop-blur-sm flex flex-col h-full`}>
                      <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-r ${advantage.color} text-white rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                        {advantage.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{advantage.title}</h3>
                      <p className="text-gray-600 leading-relaxed flex-1">{advantage.description}</p>
                      
                      {/* 装饰性元素 */}
                      <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedContainer>
          </div>
          
          {/* 背景装饰 */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        </section>

        {/* 发展历程 */}
        <section className="py-20 bg-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="text-center mb-16">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <TrophyIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">发展历程</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  从创立至今，我们始终专注于考研教育，不断创新发展
                </p>
              </div>

              <div className="relative">
                {/* 时间线 */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-purple-200 to-green-200"></div>

                <div className="space-y-16">
                  {[
                    {
                      year: '2015',
                      title: '机构成立',
                      description: '在北京成立，专注考研教育培训',
                      color: 'from-blue-500 to-blue-600',
                      bgColor: 'from-blue-50 to-blue-100'
                    },
                    {
                      year: '2017',
                      title: '规模扩大',
                      description: '师资团队扩展至50人，学员突破1000人',
                      color: 'from-purple-500 to-purple-600',
                      bgColor: 'from-purple-50 to-purple-100'
                    },
                    {
                      year: '2019',
                      title: '在线教育',
                      description: '推出在线教育平台，服务全国学员',
                      color: 'from-green-500 to-green-600',
                      bgColor: 'from-green-50 to-green-100'
                    },
                    {
                      year: '2021',
                      title: '品牌升级',
                      description: '全面升级教学体系，录取率创新高',
                      color: 'from-orange-500 to-orange-600',
                      bgColor: 'from-orange-50 to-orange-100'
                    },
                    {
                      year: '2023',
                      title: '持续发展',
                      description: '累计服务学员超过10000人，继续领跑行业',
                      color: 'from-pink-500 to-pink-600',
                      bgColor: 'from-pink-50 to-pink-100'
                    }
                  ].map((milestone, index) => (
                    <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} group`}>
                      <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                        <div className={`bg-gradient-to-br ${milestone.bgColor} p-8 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-white/50 backdrop-blur-sm group-hover:scale-105`}>
                          <div className={`inline-block bg-gradient-to-r ${milestone.color} text-white px-4 py-2 rounded-full font-bold text-lg mb-4`}>
                            {milestone.year}
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{milestone.title}</h3>
                          <p className="text-gray-600 leading-relaxed text-lg">{milestone.description}</p>
                          
                          {/* 装饰性元素 */}
                          <div className="absolute top-4 right-4 w-3 h-3 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                      
                      <div className="relative flex items-center justify-center w-12 h-12 z-10">
                        <div className={`w-8 h-8 bg-gradient-to-r ${milestone.color} rounded-full border-4 border-white shadow-xl group-hover:scale-125 transition-transform duration-300`}>
                          <div className="w-full h-full rounded-full bg-white/30 animate-pulse"></div>
                        </div>
                      </div>
                      
                      <div className="w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedContainer>
          </div>
          
          {/* 背景装饰 */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-30 blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-green-100 to-blue-100 rounded-full opacity-30 blur-2xl"></div>
        </section>

        {/* 团队介绍 */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              <div className="text-center mb-16">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <UserGroupIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">核心团队</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  我们拥有一支专业、敬业的教学团队，为您的考研之路保驾护航
                </p>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: '张教授',
                  position: '数学教学总监',
                  education: '清华大学数学系博士',
                  experience: '15年考研数学教学经验',
                  avatar: '/images/team/member-1.svg'
                },
                {
                  name: '李老师',
                  position: '英语教学主管',
                  education: '北京外国语大学硕士',
                  experience: '12年考研英语教学经验',
                  avatar: '/images/team/member-2.svg'
                },
                {
                  name: '王老师',
                  position: '政治教学专家',
                  education: '中国人民大学博士',
                  experience: '10年考研政治教学经验',
                  avatar: '/images/team/member-3.svg'
                }
              ].map((member, index) => (
                <div key={index} className="group">
                  <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-100">
                    <div className="relative overflow-hidden">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* 装饰性元素 */}
                      <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <StarIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{member.name}</h3>
                      <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                        {member.position}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <AcademicCapIcon className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="text-sm">{member.education}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <TrophyIcon className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="text-sm">{member.experience}</span>
                        </div>
                      </div>
                      
                      {/* 底部装饰 */}
                      <div className="mt-6 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </AnimatedContainer>
          </div>
          
          {/* 背景装饰 */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full opacity-30 blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-30 blur-2xl"></div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <AnimatedContainer>
              <div className="mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                    <HeartIcon className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">加入我们，实现梦想</h2>
                <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                  选择我们，就是选择专业、选择成功。让我们一起为您的考研之路保驾护航
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="group bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                  <span className="flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    免费咨询
                  </span>
                </button>
                <button className="group border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                  <span className="flex items-center justify-center">
                    <AcademicCapIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    查看课程
                  </span>
                </button>
              </div>
            </AnimatedContainer>
          </div>
          
          {/* 背景装饰 */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;