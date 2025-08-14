import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import OptimizedParticleBackground from './OptimizedParticleBackground'
import SOSButton from './SOSButton'
import BreathingExercise from './BreathingExercise'
import EmotionWave from './EmotionWave'
import ThoughtCooling from './ThoughtCooling'
import DailyJourneyPage from './DailyJourneyPage'
import SmartInsights from './SmartInsights'
import DataVisualization from './DataVisualization'

const HomePage = () => {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sosMode, setSOSMode] = useState(null) // null, 'breathing', 'wave', 'thought'
  const [showDailyJourney, setShowDailyJourney] = useState(false)
  const [showSmartInsights, setShowSmartInsights] = useState(false)
  const [showDataVisualization, setShowDataVisualization] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const quickActions = [
    {
      title: '记录情绪',
      description: '记录当前的心情和想法',
      icon: '📝',
      gradient: 'from-blue-400 to-cyan-500',
      hoverGradient: 'from-blue-500 to-cyan-600',
      action: () => navigate('/mood-journal')
    },
    {
      title: '每日旅程',
      description: '系统化的心理健康技能学习',
      icon: '🗺️',
      gradient: 'from-indigo-400 to-purple-500',
      hoverGradient: 'from-indigo-500 to-purple-600',
      action: () => setShowDailyJourney(true)
    },
    {
      title: '智能洞察',
      description: '发现模式并获得个性化建议',
      icon: '🔍',
      gradient: 'from-purple-400 to-pink-500',
      hoverGradient: 'from-purple-500 to-pink-600',
      action: () => setShowSmartInsights(true)
    },
    {
      title: '数据可视化',
      description: '查看你的进步和趋势图表',
      icon: '📊',
      gradient: 'from-cyan-400 to-blue-500',
      hoverGradient: 'from-cyan-500 to-blue-600',
      action: () => setShowDataVisualization(true)
    },
    {
      title: '正念练习',
      description: '开始一段放松的引导练习',
      icon: '🧘‍♀️',
      gradient: 'from-green-400 to-emerald-500',
      hoverGradient: 'from-green-500 to-emerald-600',
      action: () => navigate('/exercises')
    },
    {
      title: '查看历史',
      description: '回顾过往的情绪记录',
      icon: '📚',
      gradient: 'from-amber-400 to-orange-500',
      hoverGradient: 'from-amber-500 to-orange-600',
      action: () => navigate('/history')
    }
  ]

  const dailyQuotes = [
    "记住，关注自己的情绪是自我关爱的重要一步。",
    "每一次记录都是对自己的温柔关怀。",
    "内心的平静来自于对当下的接纳。",
    "你的感受是有效的，值得被倾听和理解。",
    "成长的路上，温柔地对待自己。"
  ]

  const [currentQuote] = useState(dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return '夜深了'
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  const getTimeIcon = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return '🌙'
    if (hour < 12) return '🌅'
    if (hour < 18) return '☀️'
    return '🌆'
  }

  // 智能洞察模式渲染
  if (showSmartInsights) {
    return (
      <SmartInsights
        onBack={() => setShowSmartInsights(false)}
      />
    )
  }

  // 数据可视化模式渲染
  if (showDataVisualization) {
    return (
      <DataVisualization
        onBack={() => setShowDataVisualization(false)}
      />
    )
  }

  // 每日旅程模式渲染
  if (showDailyJourney) {
    return (
      <DailyJourneyPage
        onBack={() => setShowDailyJourney(false)}
      />
    )
  }

  // SOS模式渲染
  if (sosMode === 'breathing') {
    return (
      <BreathingExercise
        onComplete={(nextAction) => {
          if (nextAction === 'wave') {
            setSOSMode('wave')
          } else {
            setSOSMode(null)
          }
        }}
        onBack={() => setSOSMode(null)}
      />
    )
  }

  if (sosMode === 'wave') {
    return (
      <EmotionWave
        onComplete={() => setSOSMode(null)}
        onBack={() => setSOSMode('breathing')}
      />
    )
  }

  if (sosMode === 'thought') {
    return (
      <ThoughtCooling
        onComplete={(responses) => {
          console.log('思维降温完成:', responses)
          setSOSMode(null)
        }}
        onBack={() => setSOSMode(null)}
      />
    )
  }

  // 默认主页渲染

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/src/assets/home-bg.webp")`,
          filter: 'brightness(0.8)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/30 via-green-900/20 to-blue-900/40" />
      
      <OptimizedParticleBackground color="#FACC15" quantity={8} />

      <div className="relative z-10 min-h-screen">
        {/* 顶部时间和问候 */}
        <div className="text-center pt-8 pb-6">
          <div className="text-white/80 text-sm mb-2">
            {currentTime.toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </div>
          <div className="text-white/60 text-xs">
            {currentTime.toLocaleTimeString('zh-CN', { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* 欢迎区域 */}
        <div className="text-center mb-8 px-6">
          <div className="relative mb-6">
            <div 
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center relative"
              style={{
                backgroundImage: `url('/src/assets/heart-icon.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* 光晕效果 */}
              <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-yellow-400/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">
            {getTimeIcon()} {getGreeting()}
          </h1>
          <p className="text-white/80 leading-relaxed">
            今天感觉怎么样？让我们一起关注你的心理健康
          </p>
        </div>

        {/* 今日状态卡片 */}
        <div className="px-6 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">今日状态</h3>
                <p className="text-white/70 text-sm">还没有记录今天的情绪</p>
              </div>
              <button 
                onClick={() => navigate('/mood-journal')}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white text-sm hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 shadow-lg"
              >
                立即记录
              </button>
            </div>
          </div>
        </div>

        {/* 快速操作卡片 */}
        <div className="px-6 mb-6">
          <h2 className="text-white font-semibold mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            快速操作
          </h2>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer"
                onClick={action.action}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">
                      {action.title}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {action.description}
                    </p>
                  </div>
                  
                  <div className="text-white/40 group-hover:text-yellow-400 transition-colors">
                    <span className="text-xl">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 每日提醒 */}
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-400/30">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2 flex items-center justify-center">
                <span className="mr-2">💡</span>
                每日提醒
              </h3>
              <p className="text-white/90 leading-relaxed text-sm">
                {currentQuote}
              </p>
            </div>
          </div>
        </div>

        {/* 本周概览 */}
        <div className="px-6 pb-24">
          <h2 className="text-white font-semibold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            本周概览
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-2xl font-bold text-green-400 mb-1">5</div>
              <div className="text-white/70 text-xs">记录天数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-2xl font-bold text-blue-400 mb-1">7.2</div>
              <div className="text-white/70 text-xs">平均心情</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="text-2xl font-bold text-purple-400 mb-1">3</div>
              <div className="text-white/70 text-xs">练习次数</div>
            </div>
          </div>
        </div>
      </div>

      {/* SOS按钮 */}
      {!sosMode && (
        <SOSButton
          onEmotionHelp={() => setSOSMode('breathing')}
          onThoughtHelp={() => setSOSMode('thought')}
        />
      )}
    </div>
  )
}

export default HomePage

