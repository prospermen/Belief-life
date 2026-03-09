import { useState, useEffect, useMemo, useCallback } from 'react'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import ThinkingDetective from './ThinkingDetective'
import ValueCompass from './ValueCompass'
import ThinkingGames from './ThinkingGames'

const DailyJourneyPage = ({ onBack }) => {
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [completedToday, setCompletedToday] = useState(new Set())
  const [currentDate] = useState(new Date().toDateString())

  // 每日活动配置
  const dailyActivities = useMemo(() => [
    {
      id: 'detective',
      title: '思维侦探日志',
      subtitle: 'CBT认知行为疗法',
      description: '通过引导式提问分析和重构自动化思维',
      icon: '🔍',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-400/30',
      duration: '8-10分钟',
      type: 'CBT'
    },
    {
      id: 'compass',
      title: '价值罗盘',
      subtitle: 'ACT接纳承诺疗法',
      description: '探索内在价值观并设定具体行动',
      icon: '🧭',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-400/30',
      duration: '6-8分钟',
      type: 'ACT'
    },
    {
      id: 'games',
      title: '思维游戏',
      subtitle: 'ACT认知解离练习',
      description: '通过游戏化练习与想法拉开距离',
      icon: '🎮',
      color: 'from-green-500 to-teal-500',
      bgColor: 'from-green-500/20 to-teal-500/20',
      borderColor: 'border-green-400/30',
      duration: '5-7分钟',
      type: 'ACT'
    }
  ], [])

  // 检查今日是否已完成某个活动
  const isCompletedToday = useCallback((activityId) => {
    const key = `${activityId}_${currentDate}`
    return localStorage.getItem(key) === 'completed'
  }, [currentDate])

  // 标记活动为已完成
  const markAsCompleted = (activityId) => {
    const key = `${activityId}_${currentDate}`
    localStorage.setItem(key, 'completed')
    setCompletedToday(prev => new Set([...prev, activityId]))
  }

  useEffect(() => {
    // 初始化今日完成状态
    const completed = new Set()
    dailyActivities.forEach(activity => {
      if (isCompletedToday(activity.id)) {
        completed.add(activity.id)
      }
    })
    setCompletedToday(completed)
  }, [dailyActivities, isCompletedToday])

  const handleActivityComplete = (activityId) => {
    markAsCompleted(activityId)
    setSelectedActivity(null)
  }

  const handleActivitySelect = (activityId) => {
    setSelectedActivity(activityId)
  }

  // 渲染特定活动组件
  if (selectedActivity === 'detective') {
    return (
      <ThinkingDetective
        onComplete={() => handleActivityComplete('detective')}
        onBack={() => setSelectedActivity(null)}
      />
    )
  }

  if (selectedActivity === 'compass') {
    return (
      <ValueCompass
        onComplete={() => handleActivityComplete('compass')}
        onBack={() => setSelectedActivity(null)}
      />
    )
  }

  if (selectedActivity === 'games') {
    return (
      <ThinkingGames
        onComplete={() => handleActivityComplete('games')}
        onBack={() => setSelectedActivity(null)}
      />
    )
  }

  // 主页面渲染
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-900 to-slate-900">
      {/* 背景粒子效果 */}
      <OptimizedParticleBackground color="#6366F1" quantity={12} />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between p-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <span className="text-2xl">←</span>
            <span>返回</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">每日旅程</h1>
            <p className="text-white/70">今天的心理健康学习</p>
          </div>
          
          <div className="text-white/80 text-right">
            <div className="text-sm">今日进度</div>
            <div className="text-lg font-mono">
              {completedToday.size}/{dailyActivities.length}
            </div>
          </div>
        </div>

        {/* 今日日期和激励语 */}
        <div className="text-center px-6 mb-8">
          <div className="text-white/60 text-sm mb-2">
            {new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
          <div className="text-white/90 text-lg">
            每天进步一点点，心理健康每一天 ✨
          </div>
        </div>

        {/* 活动卡片列表 */}
        <div className="flex-1 px-6 pb-24">
          <div className="space-y-6">
            {dailyActivities.map((activity) => {
              const isCompleted = completedToday.has(activity.id)
              const isAvailable = true // 所有活动都可用，可以根据需要调整解锁逻辑
              
              return (
                <div
                  key={activity.id}
                  className={`relative ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                  onClick={() => isAvailable && handleActivitySelect(activity.id)}
                >
                  {/* 活动卡片 */}
                  <div className={`bg-gradient-to-r ${activity.bgColor} backdrop-blur-sm rounded-2xl p-6 border ${activity.borderColor} hover:border-white/40 transition-all duration-300 ${isAvailable ? 'hover:scale-105 hover:shadow-2xl' : ''}`}>
                    {/* 完成状态标记 */}
                    {isCompleted && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                    
                    {/* 卡片内容 */}
                    <div className="flex items-center space-x-4">
                      {/* 图标 */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activity.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-3xl">{activity.icon}</span>
                      </div>
                      
                      {/* 内容 */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-white font-bold text-lg">
                            {activity.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.type === 'CBT' ? 'bg-blue-500/30 text-blue-200' : 'bg-purple-500/30 text-purple-200'}`}>
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mb-2">
                          {activity.subtitle}
                        </p>
                        <p className="text-white/80 text-sm mb-3">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-xs">
                            ⏱ {activity.duration}
                          </span>
                          {isCompleted ? (
                            <span className="text-green-400 text-xs font-medium">
                              今日已完成
                            </span>
                          ) : (
                            <span className="text-white/40 text-xs">
                              点击开始 →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 今日完成提示 */}
          {completedToday.size === dailyActivities.length && (
            <div className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-white font-bold text-lg mb-2">
                今日旅程完成！
              </h3>
              <p className="text-white/80 text-sm">
                恭喜你完成了今天的所有心理健康练习。坚持就是胜利！
              </p>
            </div>
          )}

          {/* 底部提示 */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              💡 建议每天选择1-2个练习，循序渐进地提升心理健康水平
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyJourneyPage

