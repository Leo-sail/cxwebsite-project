/**
 * 关于我们页面
 */
import React from 'react';
import { SEO, AnimatedContainer } from '../components';
import { useText } from '../hooks/useText';
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
  // SEO相关文本
  const seoTitle = useText('about_seo_title', 'about');
  const seoDescription = useText('about_seo_description', 'about');
  const seoKeywords = useText('about_seo_keywords', 'about');
  
  // Hero Section文本
  const heroTitle = useText('about_hero_title', 'about');
  const heroSubtitle = useText('about_hero_subtitle', 'about');
  const heroDescription = useText('about_hero_description', 'about');
  const heroTag1 = useText('about_hero_tag_1', 'about');
  const heroTag2 = useText('about_hero_tag_2', 'about');
  const heroTag3 = useText('about_hero_tag_3', 'about');
  
  // 机构介绍文本
  const missionTitle = useText('about_mission_title', 'about');
  const missionSubtitle = useText('about_mission_subtitle', 'about');
  const institutionTitle = useText('about_institution_title', 'about');
  const institutionDesc = useText('about_institution_desc', 'about');
  const personalizedTitle = useText('about_personalized_title', 'about');
  const personalizedDesc = useText('about_personalized_desc', 'about');
  const achievementTitle = useText('about_achievement_title', 'about');
  const achievementDesc = useText('about_achievement_desc', 'about');
  const successStudents = useText('about_success_students', 'about');
  const successStudentsLabel = useText('about_success_students_label', 'about');
  
  // 核心优势文本
  const advantagesTitle = useText('about_advantages_title', 'about');
  const advantagesDescription = useText('about_advantages_description', 'about');
  const advantage1Title = useText('about_advantage_1_title', 'about');
  const advantage1Desc = useText('about_advantage_1_desc', 'about');
  const advantage2Title = useText('about_advantage_2_title', 'about');
  const advantage2Desc = useText('about_advantage_2_desc', 'about');
  const advantage3Title = useText('about_advantage_3_title', 'about');
  const advantage3Desc = useText('about_advantage_3_desc', 'about');
  const advantage4Title = useText('about_advantage_4_title', 'about');
  const advantage4Desc = useText('about_advantage_4_desc', 'about');
  
  // 发展历程文本
  const historyTitle = useText('about_history_title', 'about');
  const historyDescription = useText('about_history_description', 'about');
  const milestone1Title = useText('about_milestone_1_title', 'about');
  const milestone1Desc = useText('about_milestone_1_desc', 'about');
  const milestone2Title = useText('about_milestone_2_title', 'about');
  const milestone2Desc = useText('about_milestone_2_desc', 'about');
  const milestone3Title = useText('about_milestone_3_title', 'about');
  const milestone3Desc = useText('about_milestone_3_desc', 'about');
  const milestone4Title = useText('about_milestone_4_title', 'about');
  const milestone4Desc = useText('about_milestone_4_desc', 'about');
  const milestone5Title = useText('about_milestone_5_title', 'about');
  const milestone5Desc = useText('about_milestone_5_desc', 'about');
  
  // 团队介绍文本
  const teamTitle = useText('about_team_title', 'about');
  const teamDescription = useText('about_team_description', 'about');
  const member1Name = useText('about_member_1_name', 'about');
  const member1Position = useText('about_member_1_position', 'about');
  const member1Education = useText('about_member_1_education', 'about');
  const member1Experience = useText('about_member_1_experience', 'about');
  const member2Name = useText('about_member_2_name', 'about');
  const member2Position = useText('about_member_2_position', 'about');
  const member2Education = useText('about_member_2_education', 'about');
  const member2Experience = useText('about_member_2_experience', 'about');
  const member3Name = useText('about_member_3_name', 'about');
  const member3Position = useText('about_member_3_position', 'about');
  const member3Education = useText('about_member_3_education', 'about');
  const member3Experience = useText('about_member_3_experience', 'about');
  
  // CTA部分文本
  const ctaTitle = useText('about_cta_title', 'about');
  const ctaDescription = useText('about_cta_description', 'about');
  const ctaConsult = useText('about_cta_consult', 'about');
  const ctaCourses = useText('about_cta_courses', 'about');
  
  // 联系信息文本
  const contactPageTitle = useText('contact_page_title', 'contact');
  const contactPageDescription = useText('contact_page_description', 'contact');
  const consultationTitle = useText('consultation_title', 'contact');
  const consultationPhone = useText('consultation_phone', 'contact');
  const consultationDesc = useText('consultation_desc', 'contact');
  const addressTitle = useText('address_title', 'contact');
  const addressText = useText('address_text', 'contact');
  const addressDesc = useText('address_desc', 'contact');
  const wechatTitle = useText('wechat_title', 'contact');
  const wechatId = useText('wechat_id', 'contact');
  const wechatDesc = useText('wechat_desc', 'contact');
  const workTimeTitle = useText('work_time_title', 'contact');
  const workTimeText = useText('work_time_text', 'contact');
  const workTimeDesc = useText('work_time_desc', 'contact');
  const formTitle = useText('form_title', 'contact');
  const formDescription = useText('form_description', 'contact');
  const nameLabel = useText('name_label', 'contact');
  const namePlaceholder = useText('name_placeholder', 'contact');
  const phoneLabel = useText('phone_label', 'contact');
  const phonePlaceholder = useText('phone_placeholder', 'contact');
  const courseLabel = useText('course_label', 'contact');
  const coursePlaceholder = useText('course_placeholder', 'contact');
  const messageLabel = useText('message_label', 'contact');
  const messagePlaceholder = useText('message_placeholder', 'contact');
  const submitButtonText = useText('submit_button_text', 'contact');
  const mapDescription = useText('map_description', 'contact');
  const mapLoadingText = useText('map_loading_text', 'contact');
  const mapAddressText = useText('map_address_text', 'contact');
  const mapBusinessHours = useText('map_business_hours', 'contact');
  const mapPhoneText = useText('map_phone_text', 'contact');
  const mapDetailAddressLabel = useText('map_detail_address_label', 'contact');
  const mapDetailAddressText = useText('map_detail_address_text', 'contact');
  const mapBusinessHoursLabel = useText('map_business_hours_label', 'contact');
  const mapBusinessHoursText = useText('map_business_hours_text', 'contact');
  const mapContactPhoneLabel = useText('map_contact_phone_label', 'contact');
  const mapContactPhoneText = useText('map_contact_phone_text', 'contact');
  
  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
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
                  {heroTitle}
                  <span className="block text-xl md:text-2xl lg:text-3xl font-normal mt-3 text-white/90">
                    {heroSubtitle}
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-6 leading-relaxed">
                  {heroDescription}
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5" />
                    <span>{heroTag1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5" />
                    <span>{heroTag2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HeartIcon className="w-5 h-5" />
                    <span>{heroTag3}</span>
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
                        <h2 className="text-4xl font-bold text-gray-900">{missionTitle}</h2>
                        <p className="text-blue-600 font-medium">{missionSubtitle}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-l-4 border-blue-500">
                      <p className="font-medium text-gray-800 mb-2">{institutionTitle}</p>
                      <p>
                        {institutionDesc}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                      <p className="font-medium text-gray-800 mb-2">{personalizedTitle}</p>
                      <p>
                        {personalizedDesc}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-l-4 border-green-500">
                      <p className="font-medium text-gray-800 mb-2">{achievementTitle}</p>
                      <p>
                        {achievementDesc}
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
                      <div className="text-4xl font-bold mb-2">{successStudents}</div>
                      <div className="text-blue-100 font-medium">{successStudentsLabel}</div>
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
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{advantagesTitle}</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {advantagesDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                {[
                  {
                    icon: <AcademicCapIcon className="h-8 w-8" />,
                    title: advantage1Title,
                    description: advantage1Desc,
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'from-blue-50 to-blue-100'
                  },
                  {
                    icon: <ChartBarIcon className="h-8 w-8" />,
                    title: advantage2Title,
                    description: advantage2Desc,
                    color: 'from-purple-500 to-purple-600',
                    bgColor: 'from-purple-50 to-purple-100'
                  },
                  {
                    icon: <UserGroupIcon className="h-8 w-8" />,
                    title: advantage3Title,
                    description: advantage3Desc,
                    color: 'from-green-500 to-green-600',
                    bgColor: 'from-green-50 to-green-100'
                  },
                  {
                    icon: <CheckCircleIcon className="h-8 w-8" />,
                    title: advantage4Title,
                    description: advantage4Desc,
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
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{historyTitle}</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {historyDescription}
                </p>
              </div>

              <div className="relative">
                {/* 时间线 */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-200 via-purple-200 to-green-200"></div>

                <div className="space-y-16">
                  {[
                    {
                      year: '2015',
                      title: milestone1Title,
                      description: milestone1Desc,
                      color: 'from-blue-500 to-blue-600',
                      bgColor: 'from-blue-50 to-blue-100'
                    },
                    {
                      year: '2017',
                      title: milestone2Title,
                      description: milestone2Desc,
                      color: 'from-purple-500 to-purple-600',
                      bgColor: 'from-purple-50 to-purple-100'
                    },
                    {
                      year: '2019',
                      title: milestone3Title,
                      description: milestone3Desc,
                      color: 'from-green-500 to-green-600',
                      bgColor: 'from-green-50 to-green-100'
                    },
                    {
                      year: '2021',
                      title: milestone4Title,
                      description: milestone4Desc,
                      color: 'from-orange-500 to-orange-600',
                      bgColor: 'from-orange-50 to-orange-100'
                    },
                    {
                      year: '2023',
                      title: milestone5Title,
                      description: milestone5Desc,
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
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{teamTitle}</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {teamDescription}
                </p>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: member1Name,
                  position: member1Position,
                  education: member1Education,
                  experience: member1Experience,
                  avatar: '/images/team/member-1.svg'
                },
                {
                  name: member2Name,
                  position: member2Position,
                  education: member2Education,
                  experience: member2Experience,
                  avatar: '/images/team/member-2.svg'
                },
                {
                  name: member3Name,
                  position: member3Position,
                  education: member3Education,
                  experience: member3Experience,
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

        {/* 联系信息区域 */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedContainer>
              {/* 标题部分 */}
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  {contactPageTitle}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {contactPageDescription}
                </p>
              </div>

              {/* 联系方式网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {/* 咨询热线 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{consultationTitle}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{consultationPhone}</p>
                  <p className="text-gray-600">{consultationDesc}</p>
                </div>

                {/* 地址信息 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{addressTitle}</h3>
                  <p className="text-lg font-semibold text-green-600 mb-2">{addressText}</p>
                  <p className="text-gray-600">{addressDesc}</p>
                </div>

                {/* 微信咨询 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{wechatTitle}</h3>
                  <p className="text-lg font-semibold text-purple-600 mb-2">{wechatId}</p>
                  <p className="text-gray-600">{wechatDesc}</p>
                </div>
              </div>

              {/* 工作时间 */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 text-center mb-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{workTimeTitle}</h3>
                <p className="text-xl font-semibold text-orange-600 mb-2">{workTimeText}</p>
                <p className="text-gray-600">{workTimeDesc}</p>
              </div>

              {/* 咨询表单 */}
              <div className="bg-gray-50 rounded-3xl p-8 lg:p-12">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{formTitle}</h3>
                  <p className="text-lg text-gray-600">{formDescription}</p>
                </div>
                
                <form className="max-w-2xl mx-auto space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{nameLabel}</label>
                      <input
                        type="text"
                        placeholder={namePlaceholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{phoneLabel}</label>
                      <input
                        type="tel"
                        placeholder={phonePlaceholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{courseLabel}</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                      <option value="">{coursePlaceholder}</option>
                      <option value="ielts">雅思课程</option>
                      <option value="toefl">托福课程</option>
                      <option value="sat">SAT课程</option>
                      <option value="gre">GRE课程</option>
                      <option value="gmat">GMAT课程</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{messageLabel}</label>
                    <textarea
                      rows={4}
                      placeholder={messagePlaceholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    ></textarea>
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      {submitButtonText}
                    </button>
                  </div>
                </form>
              </div>

              {/* 地图区域 */}
              <div className="mt-16">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">位置导航</h3>
                  <p className="text-lg text-gray-600">{mapDescription}</p>
                </div>
                
                <div className="bg-gray-100 rounded-2xl p-8 text-center">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <p className="text-gray-500 mb-4">{mapLoadingText}</p>
                    
                    {/* 地图信息卡片 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">{mapDetailAddressLabel}</h4>
                        <p className="text-gray-600">{mapDetailAddressText}</p>
                      </div>
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">{mapBusinessHoursLabel}</h4>
                        <p className="text-gray-600">{mapBusinessHoursText}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          <span>周六至周日</span> • <span>节假日</span>
                        </p>
                      </div>
                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">{mapContactPhoneLabel}</h4>
                        <p className="text-blue-600 font-semibold">{mapContactPhoneText}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          <span>400-123-4567</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedContainer>
          </div>
          
          {/* 背景装饰 */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-30 blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full opacity-30 blur-2xl"></div>
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
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{ctaTitle}</h2>
                <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                  {ctaDescription}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="group bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                  <span className="flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    {ctaConsult}
                  </span>
                </button>
                <button className="group border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl">
                  <span className="flex items-center justify-center">
                    <AcademicCapIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    {ctaCourses}
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